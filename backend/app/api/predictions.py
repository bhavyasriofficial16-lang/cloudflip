from fastapi import APIRouter, Query

from app.ml.prediction.engine import forecast
from app.services.local_metrics_simulator import generate_scenario
from app.schemas import schemas as s

router = APIRouter(tags=["predictions"])


@router.get("/api/predictions", response_model=s.PredictionOut)
def get_prediction(
    horizon_minutes: int = Query(30, ge=5, le=60),
    scenario: str = Query("sudden_surge"),
    step_minutes: float = Query(3.0, gt=0),
):
    series = generate_scenario(scenario, n=40)
    f = forecast(series, step_minutes=step_minutes, horizon_minutes=horizon_minutes, metric_name="traffic")
    return s.PredictionOut(
        metric_name="traffic_rpm",
        horizon_minutes=f.horizon_minutes,
        predicted_value=f.predicted_value,
        lower_bound=f.lower_bound,
        upper_bound=f.upper_bound,
        model_name=f.model_name,
        mae=f.mae,
        rmse=f.rmse,
        mape=f.mape,
    )
