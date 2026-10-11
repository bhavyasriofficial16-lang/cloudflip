from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import models as m
from app.schemas import schemas as s
from app.ml.simulation.simulator import run_simulation

router = APIRouter(tags=["simulations"])


@router.post("/api/simulations", response_model=s.SimulationResult)
def create_simulation(payload: s.SimulationRequest, db: Session = Depends(get_db)):
    outcome = run_simulation(
        traffic_multiplier=payload.traffic_multiplier,
        horizon_minutes=payload.horizon_minutes,
        current_instances=payload.current_instances,
        per_instance_capacity_rpm=payload.per_instance_capacity_rpm,
        baseline_traffic_rpm=payload.baseline_traffic_rpm,
    )

    record = m.Simulation(
        traffic_multiplier=payload.traffic_multiplier,
        horizon_minutes=payload.horizon_minutes,
        current_instances=payload.current_instances,
        result={
            "predicted_traffic_rpm": outcome.predicted_traffic_rpm,
            "current_capacity_rpm": outcome.current_capacity_rpm,
            "required_instances": outcome.required_instances,
            "projected_cpu_pct": outcome.projected_cpu_pct,
            "projected_latency_ms": outcome.projected_latency_ms,
            "projected_error_rate_pct": outcome.projected_error_rate_pct,
            "bottleneck": outcome.bottleneck,
            "estimated_additional_cost_per_hour": outcome.estimated_additional_cost_per_hour,
        },
    )
    db.add(record)
    db.add(m.ActivityLog(event="Simulation run", result=f"{payload.traffic_multiplier}x traffic"))
    db.commit()
    db.refresh(record)

    return s.SimulationResult(
        id=record.id,
        predicted_traffic_rpm=outcome.predicted_traffic_rpm,
        current_capacity_rpm=outcome.current_capacity_rpm,
        required_instances=outcome.required_instances,
        projected_cpu_pct=outcome.projected_cpu_pct,
        projected_latency_ms=outcome.projected_latency_ms,
        projected_error_rate_pct=outcome.projected_error_rate_pct,
        bottleneck=outcome.bottleneck,
        estimated_additional_cost_per_hour=outcome.estimated_additional_cost_per_hour,
    )


@router.get("/api/simulations/{simulation_id}")
def get_simulation(simulation_id: str, db: Session = Depends(get_db)):
    record = db.query(m.Simulation).filter_by(id=simulation_id).first()
    if not record:
        raise HTTPException(404, "Simulation not found")
    return {
        "id": record.id,
        "traffic_multiplier": record.traffic_multiplier,
        "horizon_minutes": record.horizon_minutes,
        "current_instances": record.current_instances,
        "result": record.result,
        "created_at": record.created_at,
    }
