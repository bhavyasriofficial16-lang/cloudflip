from fastapi import APIRouter, Query

from app.ml.anomaly.detector import detect
from app.services.local_metrics_simulator import generate_scenario

router = APIRouter(tags=["anomalies"])


@router.get("/api/anomalies")
def get_anomalies(
    scenario: str = Query("sudden_surge"),
    method: str = Query("zscore", description="zscore | ewma"),
):
    series = generate_scenario(scenario, n=30)
    result = detect(series, method=method)
    return {
        "metric_name": "traffic_rpm",
        "current_value": result.current_value,
        "baseline_value": result.baseline_value,
        "deviation_sigma": result.deviation_sigma,
        "is_anomaly": result.is_anomaly,
        "severity": result.severity,
        "method": result.method,
        "note": "A statistical deviation, not automatically an outage — see Bottlenecks for downstream impact.",
    }
