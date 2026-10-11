from fastapi import APIRouter

from app.ml.capacity.engine import find_bottleneck
from app.services.local_metrics_simulator import generate_scenario

router = APIRouter(tags=["bottlenecks"])


@router.get("/api/bottlenecks")
def get_bottlenecks():
    db_series = generate_scenario("database_bottleneck", n=12)
    cpu_series = [58, 61, 66, 71, 76, 80, 84, 87, 89, 91]
    queue_series = generate_scenario("queue_buildup", n=12, base=300, arrival_rate=9, service_rate=8.7)

    findings = [
        find_bottleneck("db_connections", db_series[-1], 200, db_series, step_minutes=3),
        find_bottleneck("cpu", cpu_series[-1], 95, cpu_series, step_minutes=3),
        find_bottleneck("queue_depth", queue_series[-1], 1000, queue_series, step_minutes=3),
    ]
    return [
        {
            "constraint_type": f.constraint_type,
            "current_value": round(f.current_value, 1),
            "limit_value": f.limit_value,
            "trend": f.trend,
            "eta_minutes": f.eta_minutes,
            "evidence": f.evidence,
        }
        for f in findings
    ]
