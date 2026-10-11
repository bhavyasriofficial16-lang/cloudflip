import time
from collections import defaultdict
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import get_settings
from app.database.session import Base, engine, SessionLocal
from app.services.seed_demo import seed
from app.api import resources, metrics, predictions, anomalies, bottlenecks, simulations, recommendations, actions, cost, activity, billing, settings as settings_api, daemon
from app.services.daemon import telemetry_daemon

settings = get_settings()

app = FastAPI(
    title="CloudFlip.ai API",
    description="AI-powered predictive cloud infrastructure platform — backend API.",
    version="0.1.0",
)

# In-memory sliding window rate limiter
RATE_LIMIT_MAX_REQUESTS = 120
RATE_LIMIT_WINDOW_SECONDS = 60
_request_history = defaultdict(list)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # 1. Rate Limiting Check (DDoS / Scraping Protection)
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Prune old timestamps
    _request_history[client_ip] = [t for t in _request_history[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    
    # If client exceeds limit and is not an exempt health check
    if len(_request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS and not request.url.path.endswith("/health"):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. CloudFlip API rate limit exceeded. Please retry in 60s."},
            headers={"Retry-After": "60"}
        )
    
    _request_history[client_ip].append(now)

    # 2. Process Request
    response: Response = await call_next(request)

    # 3. Inject Production Enterprise Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(resources.router)
app.include_router(metrics.router)
app.include_router(predictions.router)
app.include_router(anomalies.router)
app.include_router(bottlenecks.router)
app.include_router(simulations.router)
app.include_router(recommendations.router)
app.include_router(actions.router)
app.include_router(cost.router)
app.include_router(activity.router)
app.include_router(billing.router)
app.include_router(settings_api.router)
app.include_router(daemon.router)


@app.on_event("startup")
def on_startup():
    # For an MVP, create tables directly; switch to Alembic migrations
    # (already scaffolded in requirements.txt) once the schema stabilizes.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
    # Start 24/7 background telemetry & autonomous scaling daemon
    telemetry_daemon.start()


@app.on_event("shutdown")
def on_shutdown():
    telemetry_daemon.stop()


@app.get("/")
def root():
    return {
        "service": "CloudFlip.ai API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "environment": settings.environment,
        "mode": "live" if settings.is_live else "demo",
        "simulation_only_mode": settings.simulation_only_mode,
        "daemon": telemetry_daemon.get_status(),
    }

