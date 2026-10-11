import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config.settings import get_settings

logger = logging.getLogger("cloudflip.db")
settings = get_settings()


def get_clean_db_url(url: str) -> str:
    if not url:
        return "sqlite:///./cloudflip.db"
    # Fix Render/Heroku/Supabase postgres:// scheme
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


def create_robust_engine():
    target_url = get_clean_db_url(settings.database_url)
    is_sqlite = target_url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}

    try:
        eng = create_engine(target_url, pool_pre_ping=True, connect_args=connect_args)
        # Test connection immediately
        with eng.connect() as conn:
            pass
        return eng
    except Exception as exc:
        logger.warning(
            f"Database connection to '{target_url}' failed: {exc}. "
            "Falling back to local SQLite 'sqlite:///./cloudflip.db' for guaranteed uptime."
        )
        return create_engine("sqlite:///./cloudflip.db", pool_pre_ping=True, connect_args={"check_same_thread": False})


engine = create_robust_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a request-scoped DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
