from datetime import datetime, timedelta
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import models as m
from app.auth.dependencies import get_current_user
from app.billing.plans import PLANS, get_plan
from app.billing.stripe_client import stripe_client
from app.billing.razorpay_client import razorpay_client
from app.config.settings import get_settings

router = APIRouter(prefix="/api/billing", tags=["billing"])
settings = get_settings()


class RazorpayOrderRequest(BaseModel):
    plan_id: str


class RazorpayVerifyRequest(BaseModel):
    plan_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.get("/plans")
def list_plans():
    """Public — powers the pricing page with dual currency info (INR & USD). No auth required."""
    return PLANS


@router.get("/subscription")
def get_subscription(user: m.User = Depends(get_current_user)):
    return {
        "plan": user.plan,
        "status": user.subscription_status,
        "payment_gateway": user.payment_gateway or "stripe",
        "current_period_end": user.current_period_end,
    }


# --- Stripe Endpoints (International / USD) ---

@router.post("/checkout-session")
def create_checkout_session(plan_id: str, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    plan = get_plan(plan_id)
    if not plan or not plan["stripe_price_id"]:
        raise HTTPException(400, f"Unknown or unpriced plan: {plan_id}. Configure its Stripe Price ID in .env.")

    customer_id = stripe_client.get_or_create_customer(user.email, user.stripe_customer_id)
    if customer_id != user.stripe_customer_id:
        user.stripe_customer_id = customer_id
        user.payment_gateway = "stripe"
        db.commit()

    mode = "subscription"
    session = stripe_client.create_checkout_session(
        customer_id=customer_id,
        price_id=plan["stripe_price_id"],
        mode=mode,
        success_url=f"{settings.frontend_url}/app?checkout=success",
        cancel_url=f"{settings.frontend_url}/pricing?checkout=cancelled",
    )
    return {"checkout_url": session.url}


@router.post("/portal-session")
def create_portal_session(user: m.User = Depends(get_current_user)):
    if not user.stripe_customer_id:
        raise HTTPException(400, "No Stripe billing account found — subscribe using Stripe first.")
    session = stripe_client.create_billing_portal_session(
        customer_id=user.stripe_customer_id,
        return_url=f"{settings.frontend_url}/app/settings",
    )
    return {"portal_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripe webhook for international payments."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    event = stripe_client.construct_webhook_event(payload, sig_header)

    obj = event["data"]["object"]
    event_type = event["type"]

    if event_type in ("customer.subscription.created", "customer.subscription.updated"):
        customer_id = obj["customer"]
        user = db.query(m.User).filter_by(stripe_customer_id=customer_id).first()
        if user:
            price_id = obj["items"]["data"][0]["price"]["id"]
            user.plan = _plan_tier_for_price(price_id)
            user.subscription_status = obj["status"]
            user.stripe_subscription_id = obj["id"]
            user.payment_gateway = "stripe"
            if obj.get("current_period_end"):
                user.current_period_end = datetime.utcfromtimestamp(obj["current_period_end"])
            db.commit()

    elif event_type == "customer.subscription.deleted":
        customer_id = obj["customer"]
        user = db.query(m.User).filter_by(stripe_customer_id=customer_id).first()
        if user:
            user.plan = m.PlanTier.free
            user.subscription_status = m.SubscriptionStatus.canceled
            db.commit()

    return {"received": True}


# --- Razorpay Endpoints (India / INR) ---

@router.post("/razorpay/create-order")
def create_razorpay_order(req: RazorpayOrderRequest, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Creates a Razorpay Order in INR for Indian checkout modal.
    """
    plan = get_plan(req.plan_id)
    if not plan:
        raise HTTPException(400, f"Unknown plan: {req.plan_id}")

    amount_in_paise = plan["amount_inr"]
    order = razorpay_client.create_order(
        amount_in_paise=amount_in_paise,
        currency="INR",
        receipt=f"rcpt_{user.id[:8]}_{int(datetime.utcnow().timestamp())}",
        notes={"user_id": user.id, "plan_id": req.plan_id}
    )

    user.razorpay_order_id = order["id"]
    user.payment_gateway = "razorpay"
    db.commit()

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": settings.razorpay_key_id or "rzp_test_dummykey123",
        "plan_name": plan["name"],
        "is_demo": order.get("is_demo", False),
    }


@router.post("/razorpay/verify-payment")
def verify_razorpay_payment(req: RazorpayVerifyRequest, user: m.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Verifies Razorpay HMAC signature upon frontend checkout completion and updates plan status.
    """
    is_valid = razorpay_client.verify_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature,
    )
    if not is_valid:
        raise HTTPException(400, "Invalid Razorpay payment signature.")

    plan_tier_map = {
        "pro_monthly": m.PlanTier.pro_monthly,
        "pro_annual": m.PlanTier.pro_annual,
        "pay_as_you_go": m.PlanTier.pay_as_you_go,
        "free": m.PlanTier.free,
    }

    user.plan = plan_tier_map.get(req.plan_id, m.PlanTier.pro_monthly)
    user.subscription_status = m.SubscriptionStatus.active
    user.payment_gateway = "razorpay"
    user.razorpay_subscription_id = req.razorpay_payment_id
    user.current_period_end = datetime.utcnow() + timedelta(days=365 if req.plan_id == "pro_annual" else 30)

    db.add(m.ActivityLog(event=f"Subscribed via Razorpay: {req.plan_id}", resource_id=None, result="SUCCESS"))
    db.commit()

    return {"status": "success", "plan": user.plan, "subscription_status": user.subscription_status}


@router.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay Webhook listener for payment / subscription events in India.
    """
    payload_bytes = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    if not razorpay_client.verify_webhook_signature(payload_bytes, signature):
        raise HTTPException(400, "Invalid Razorpay webhook signature")

    import json
    data = json.loads(payload_bytes.decode("utf-8"))
    event = data.get("event")

    if event in ("subscription.charged", "order.paid", "payment.captured"):
        notes = data.get("payload", {}).get("payment", {}).get("entity", {}).get("notes", {})
        user_id = notes.get("user_id")
        plan_id = notes.get("plan_id", "pro_monthly")
        if user_id:
            user = db.query(m.User).filter_by(id=user_id).first()
            if user:
                plan_tier_map = {
                    "pro_monthly": m.PlanTier.pro_monthly,
                    "pro_annual": m.PlanTier.pro_annual,
                    "pay_as_you_go": m.PlanTier.pay_as_you_go,
                }
                user.plan = plan_tier_map.get(plan_id, m.PlanTier.pro_monthly)
                user.subscription_status = m.SubscriptionStatus.active
                user.payment_gateway = "razorpay"
                user.current_period_end = datetime.utcnow() + timedelta(days=365 if plan_id == "pro_annual" else 30)
                db.commit()

    return {"status": "received"}


def _plan_tier_for_price(price_id: str) -> m.PlanTier:
    if price_id == settings.stripe_price_annual:
        return m.PlanTier.pro_annual
    if price_id == settings.stripe_price_metered:
        return m.PlanTier.pay_as_you_go
    return m.PlanTier.pro_monthly

