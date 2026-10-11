"""
Tests for Dual Payment Gateways (Razorpay & Stripe) and Autonomous AI Remediation Agent.
"""
import pytest
from app.models import models as m
from app.billing.plans import PLANS, get_plan
from app.billing.razorpay_client import razorpay_client
from app.actions.autonomous_agent import run_autonomous_remediation_sweep
from app.database.session import Base, engine, SessionLocal


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_plans_dual_currency_catalog():
    assert len(PLANS) >= 4
    pro_m = get_plan("pro_monthly")
    assert pro_m is not None
    assert "price_inr" in pro_m
    assert "price_usd" in pro_m
    assert pro_m["price_inr"] == "₹4,999 / mo"
    assert pro_m["price_usd"] == "$59 / mo"


def test_razorpay_client_demo_order():
    order = razorpay_client.create_order(amount_in_paise=499900, currency="INR")
    assert order["amount"] == 499900
    assert order["currency"] == "INR"
    assert "id" in order

    is_valid = razorpay_client.verify_payment_signature(
        razorpay_order_id=order["id"],
        razorpay_payment_id="pay_test_123",
        razorpay_signature="sig_test_123"
    )
    assert is_valid is True


def test_autonomous_ai_remediation_agent_loop(setup_db):
    db = setup_db
    import uuid

    # Create dummy user with full autonomous mode enabled
    user = m.User(
        email=f"autonomous_{uuid.uuid4().hex[:8]}@cloudflip.ai",
        auto_remediation_mode=m.AutoRemediationMode.full_autonomous,
        auto_remediation_confidence_threshold=0.70,
    )
    db.add(user)
    db.flush()


    # Create dummy cloud account & resource
    cloud_acc = m.CloudAccount(user_id=user.id, aws_account_id="123456789012", default_region="ap-south-1")
    db.add(cloud_acc)
    db.flush()

    res = m.Resource(
        cloud_account_id=cloud_acc.id,
        aws_resource_id="asg-123",
        name="web-asg-test",
        resource_type="asg",
        region="ap-south-1"
    )

    db.add(res)
    db.flush()


    rec = m.Recommendation(
        resource_id=res.id,
        title="Predictive Scaling: Scale web-asg-test from 4 to 10 instances",
        current_state={"instances": 4},
        recommended_state={"instances": 10},
        reason="Predicted surge traffic of +180% in next 20 minutes",
        evidence=["CPU trend 58% -> 94%", "Latency 4200ms"],
        confidence="high",
        status=m.ApprovalStatus.pending
    )
    db.add(rec)
    db.commit()

    # Execute autonomous agent sweep
    results = run_autonomous_remediation_sweep(db, user=user)

    assert len(results) >= 1
    remediated = [r for r in results if r.get("rec_id") == rec.id]
    assert len(remediated) == 1
    assert remediated[0]["status"] == "remediated_and_verified"

    # Verify recommendation was auto-approved & action logged
    db.refresh(rec)
    assert rec.status == m.ApprovalStatus.approved

    logs = db.query(m.ActivityLog).filter(m.ActivityLog.resource_id == res.id).all()
    assert len(logs) >= 2
