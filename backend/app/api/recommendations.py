from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import models as m
from app.schemas import schemas as s
from app.ml.recommendations.engine import build_scale_recommendation, build_connection_pool_recommendation
from app.actions.engine import execute_scale_action
from app.verification.engine import verify_scale_action

router = APIRouter(tags=["recommendations"])


def _demo_recommendations(db: Session) -> list[m.Recommendation]:
    """
    Ensures at least the two evidence-backed demo recommendations from
    the spec exist, so the endpoint has something real to approve/reject.
    Idempotent — safe to call on every GET.
    """
    web = db.query(m.Resource).filter_by(name="web-asg-1").first()
    rds = db.query(m.Resource).filter_by(name="orders-rds").first()
    if not web or not rds:
        return db.query(m.Recommendation).all()

    if db.query(m.Recommendation).filter_by(resource_id=web.id, status=m.ApprovalStatus.pending).first() is None:
        draft = build_scale_recommendation(
            resource_id=web.id, resource_name=web.name,
            current_instances=4, required_instances=12,
            predicted_demand_rpm=31800, current_capacity_rpm=10000,
            growth_rate_pct=18, cpu_trend=(58, 91),
            cost_per_hour=142, forecast_mape=4.6,
        )
        if draft:
            db.add(m.Recommendation(
                resource_id=draft.resource_id, title=draft.title,
                current_state=draft.current_state, recommended_state=draft.recommended_state,
                reason=draft.reason, evidence=draft.evidence,
                estimated_cost_per_hour=draft.estimated_cost_per_hour, confidence=draft.confidence,
            ))

    if db.query(m.Recommendation).filter_by(resource_id=rds.id, status=m.ApprovalStatus.pending).first() is None:
        draft = build_connection_pool_recommendation(
            resource_id=rds.id, resource_name=rds.name,
            current_limit=200, current_value=184, eta_minutes=14,
        )
        db.add(m.Recommendation(
            resource_id=draft.resource_id, title=draft.title,
            current_state=draft.current_state, recommended_state=draft.recommended_state,
            reason=draft.reason, evidence=draft.evidence,
            estimated_cost_per_hour=draft.estimated_cost_per_hour, confidence=draft.confidence,
        ))

    db.commit()
    return db.query(m.Recommendation).order_by(m.Recommendation.created_at.desc()).all()


@router.get("/api/recommendations", response_model=list[s.RecommendationOut])
def list_recommendations(db: Session = Depends(get_db)):
    return _demo_recommendations(db)


@router.post("/api/recommendations/{recommendation_id}/approve")
def approve_recommendation(recommendation_id: str, db: Session = Depends(get_db)):
    rec = db.query(m.Recommendation).filter_by(id=recommendation_id).first()
    if not rec:
        raise HTTPException(404, "Recommendation not found")

    rec.status = m.ApprovalStatus.approved
    rec.decided_at = datetime.utcnow()
    db.add(m.ActivityLog(event="Recommendation approved", resource_id=rec.resource_id))

    action = m.Action(
        recommendation_id=rec.id,
        resource_id=rec.resource_id,
        action_type="modify_asg_capacity",
        previous_state=rec.current_state,
        requested_state=rec.recommended_state,
        approval_status=m.ApprovalStatus.approved,
    )
    db.add(action)
    db.flush()

    # Execute (simulated unless USE_REAL_AWS + SIMULATION_ONLY_MODE=false)
    desired = rec.recommended_state.get("instances")
    if desired:
        exec_result = execute_scale_action(asg_name=rec.resource_id, desired_instances=desired)
        action.executed = True
        action.executed_at = datetime.utcnow()
        action.is_simulated = exec_result["is_simulated"]
        action.execution_result = exec_result["execution_result"]
        db.add(m.ActivityLog(event="Action executed", resource_id=rec.resource_id, result=action.execution_result))

        # Verify — synthetic before/after for the demo; in live mode this
        # would re-query CloudWatch a few minutes after execution.
        cpu_before, cpu_after = 91.0, 54.0
        lat_before, lat_after = 4200.0, 1100.0
        err_before, err_after = 3.8, 0.7
        outcome = verify_scale_action(cpu_before, cpu_after, lat_before, lat_after, err_before, err_after)

        verification = m.ActionVerification(
            action_id=action.id,
            metrics_before={"cpu_pct": cpu_before, "latency_ms": lat_before, "error_rate_pct": err_before},
            metrics_after={"cpu_pct": cpu_after, "latency_ms": lat_after, "error_rate_pct": err_after},
            result=outcome.result,
        )
        db.add(verification)
        db.add(m.ActivityLog(event="Verification complete", resource_id=rec.resource_id, result=outcome.result))

    db.commit()
    return {"status": "approved", "action_id": action.id}


@router.post("/api/recommendations/{recommendation_id}/reject")
def reject_recommendation(recommendation_id: str, db: Session = Depends(get_db)):
    rec = db.query(m.Recommendation).filter_by(id=recommendation_id).first()
    if not rec:
        raise HTTPException(404, "Recommendation not found")
    rec.status = m.ApprovalStatus.rejected
    rec.decided_at = datetime.utcnow()
    db.add(m.ActivityLog(event="Recommendation rejected", resource_id=rec.resource_id))
    db.commit()
    return {"status": "rejected"}
