from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import models as m
from app.schemas import schemas as s
from app.auth.dependencies import get_current_user
from app.actions.autonomous_agent import run_autonomous_remediation_sweep

router = APIRouter(tags=["actions"])


class AgentPolicyUpdateRequest(BaseModel):
    auto_remediation_mode: m.AutoRemediationMode = Field(..., description="OFF | SEMI_AUTONOMOUS | FULL_AUTONOMOUS")
    confidence_threshold: float = Field(0.85, ge=0.5, le=1.0)
    max_cost_impact: float = Field(500.0, ge=0.0)


@router.get("/api/actions", response_model=list[s.ActionOut])
def list_actions(db: Session = Depends(get_db)):
    return db.query(m.Action).order_by(m.Action.created_at.desc()).all()


@router.get("/api/actions/{action_id}", response_model=s.ActionOut)
def get_action(action_id: str, db: Session = Depends(get_db)):
    a = db.query(m.Action).filter_by(id=action_id).first()
    if not a:
        raise HTTPException(404, "Action not found")
    return a


@router.get("/api/actions/{action_id}/verification", response_model=s.VerificationOut)
def get_action_verification(action_id: str, db: Session = Depends(get_db)):
    v = db.query(m.ActionVerification).filter_by(action_id=action_id).first()
    if not v:
        raise HTTPException(404, "No verification recorded for this action yet")
    return s.VerificationOut(
        action_id=v.action_id,
        metrics_before=v.metrics_before,
        metrics_after=v.metrics_after,
        result=v.result,
        verified_at=v.verified_at,
    )


# --- Autonomous AI Remediation Agent API Endpoints ---

@router.post("/api/agent/trigger-sweep")
def trigger_autonomous_agent_sweep(db: Session = Depends(get_db)):
    """
    Manually or programmatically triggers the Autonomous AI Agent loop.
    Scans pending recommendations, applies guardrail policies, auto-fixes issues, and verifies results.
    """
    demo_user = db.query(m.User).first()
    sweep_results = run_autonomous_remediation_sweep(db, user=demo_user)
    return {
        "status": "completed",
        "agent_mode": demo_user.auto_remediation_mode.value if demo_user and demo_user.auto_remediation_mode else "FULL_AUTONOMOUS",
        "timestamp": m.datetime.utcnow().isoformat(),
        "sweep_summary": sweep_results
    }


@router.get("/api/agent/policy")
def get_agent_policy(db: Session = Depends(get_db)):
    user = db.query(m.User).first()
    if not user:
        return {
            "auto_remediation_mode": "FULL_AUTONOMOUS",
            "confidence_threshold": 0.85,
            "max_cost_impact": 500.0
        }
    return {
        "auto_remediation_mode": user.auto_remediation_mode.value if user.auto_remediation_mode else "OFF",
        "confidence_threshold": user.auto_remediation_confidence_threshold or 0.85,
        "max_cost_impact": user.auto_remediation_max_cost_impact or 500.0
    }


@router.post("/api/agent/policy")
def update_agent_policy(req: AgentPolicyUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(m.User).first()
    if not user:
        user = m.User(email="demo@cloudflip.ai", full_name="Demo Admin")
        db.add(user)
        db.flush()

    user.auto_remediation_mode = req.auto_remediation_mode
    user.auto_remediation_confidence_threshold = req.confidence_threshold
    user.auto_remediation_max_cost_impact = req.max_cost_impact
    db.commit()

    return {
        "status": "updated",
        "auto_remediation_mode": user.auto_remediation_mode.value,
        "confidence_threshold": user.auto_remediation_confidence_threshold,
        "max_cost_impact": user.auto_remediation_max_cost_impact
    }

