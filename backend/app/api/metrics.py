from fastapi import APIRouter, Query
from app.services.local_metrics_simulator import generate_scenario, timestamps_back

router = APIRouter(tags=["metrics"])


@router.get("/api/metrics")
def get_metrics(
    scenario: str = Query("normal", description="normal | gradual_growth | sudden_surge | periodic | database_bottleneck | queue_buildup"),
    points: int = Query(30, ge=5, le=200),
    step_minutes: float = Query(3.0, gt=0),
):
    """
    Demo-mode metric feed. In live mode this endpoint would instead read
    from ResourceMetric rows populated by the CloudWatch collector.
    """
    values = generate_scenario(scenario, n=points)
    ts = timestamps_back(points, step_minutes)
    return {
        "scenario": scenario,
        "is_synthetic": True,
        "step_minutes": step_minutes,
        "series": [{"timestamp": t.isoformat(), "value": v} for t, v in zip(ts, values)],
    }
