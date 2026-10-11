"""
Usage metering for the pay-as-you-go plan.

Call `record_resource_hour()` once per resource per hour a user has
under active monitoring (e.g. from a scheduled task) — cheap, additive
rows. `report_pending_usage()` then sums and reports them to Stripe;
run it on a schedule (hourly/daily) rather than per-request.
"""
from sqlalchemy.orm import Session

from app.billing.stripe_client import stripe_client
from app.models import models as m


def record_resource_hour(db: Session, user_id: str, resource_id: str | None = None, quantity: int = 1) -> None:
    db.add(m.UsageRecord(user_id=user_id, resource_id=resource_id, quantity=quantity))
    db.commit()


def report_pending_usage(db: Session, subscription_item_id: str, user_id: str) -> int:
    """Sums this user's unreported usage and reports it as one increment to Stripe.
    Returns the quantity reported (0 if nothing pending or Stripe isn't configured)."""
    pending = db.query(m.UsageRecord).filter_by(user_id=user_id, reported_to_stripe=False).all()
    total = sum(r.quantity for r in pending)
    if total == 0:
        return 0
    if not stripe_client.enabled:
        return 0  # nothing reported; rows stay pending until Stripe is configured

    stripe_client.report_usage(subscription_item_id, total)
    for r in pending:
        r.reported_to_stripe = True
    db.commit()
    return total
