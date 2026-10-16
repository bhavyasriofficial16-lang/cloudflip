"""
Plan catalog. This is the one place plan names, prices, and limits are
defined — the pricing page reads it via GET /api/billing/plans, and
`app/auth/dependencies.require_active_plan` reads the same PlanTier
enum for gating, so the two can never drift apart.
"""
from app.config.settings import get_settings

settings = get_settings()

PLANS = [
    {
        "id": "free",
        "name": "Free / Starter",
        "target_customer": "Developers & Testers",
        "price_inr": "₹0",
        "price_usd": "$0",
        "price_display": "$0",
        "amount_inr": 0,
        "amount_usd": 0,
        "interval": "forever",
        "stripe_price_id": None,
        "razorpay_plan_id": None,
        "resource_limit": settings.free_plan_resource_limit,
        "features": [
            "Simulator only (up to 3 resources)",
            "Gets users hooked on the product",
            "No real AWS connection required",
            "Basic metrics & dashboard",
        ],
        "cta": "Start free",
    },
    {
        "id": "pay_as_you_go",
        "name": "Pay-As-You-Go",
        "target_customer": "Small Teams & Variable Workloads",
        "price_inr": "₹25 / resource-hr",
        "price_usd": "$0.30 / resource-hr",
        "price_display": "$0.30 / resource-hr (₹25/hr)",
        "amount_inr": 2500,    # paise
        "amount_usd": 30,      # cents
        "interval": "usage",
        "stripe_price_id": settings.stripe_price_metered,
        "razorpay_plan_id": None,
        "resource_limit": None,
        "features": [
            "Zero friction to start",
            "Scales automatically with client growth",
            "No monthly commitment",
            "Full Pro features & metrics",
        ],
        "cta": "Start Pay-As-You-Go",
    },
    {
        "id": "pro_monthly",
        "name": "Pro Monthly",
        "target_customer": "Growing Companies",
        "price_inr": "₹7,999 / mo",
        "price_usd": "$99 / mo",
        "price_display": "$99 / mo (₹7,999/mo)",
        "amount_inr": 799900,  # paise
        "amount_usd": 9900,    # cents
        "interval": "month",
        "stripe_price_id": settings.stripe_price_monthly,
        "razorpay_plan_id": settings.razorpay_plan_monthly,
        "resource_limit": None,
        "features": [
            "Predictable MRR (Monthly Recurring Revenue)",
            "Real AWS connection",
            "Predictions, anomalies & simulator",
            "Manual & autonomous AI remediation",
        ],
        "cta": "Start Pro Monthly",
    },
    {
        "id": "pro_annual",
        "name": "Pro Annual",
        "target_customer": "Established Businesses",
        "price_inr": "₹79,990 / yr",
        "price_usd": "$990 / yr",
        "price_display": "$990 / yr (2 months free)",
        "amount_inr": 7999000, # paise
        "amount_usd": 99000,   # cents
        "interval": "year",
        "stripe_price_id": settings.stripe_price_annual,
        "razorpay_plan_id": settings.razorpay_plan_annual,
        "resource_limit": None,
        "badge": "2 months free",
        "features": [
            "Upfront annual cash flow & lower churn",
            "Everything in Pro Monthly",
            "2 months free included",
            "Priority SRE support & SLA",
        ],
        "cta": "Start Pro Annual",
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "target_customer": "Large Scale Infrastructure",
        "price_inr": "Custom Quote",
        "price_usd": "Custom / Quote",
        "price_display": "Custom / Quote",
        "amount_inr": 0,
        "amount_usd": 0,
        "interval": "custom",
        "stripe_price_id": None,
        "razorpay_plan_id": None,
        "resource_limit": None,
        "badge": "Custom SLA",
        "features": [
            "SLA guarantee",
            "Custom guardrails & policy engine",
            "Dedicated solution architect",
            "Unlimited AWS/Multi-cloud accounts",
        ],
        "cta": "Contact Sales",
    },
]


def get_plan(plan_id: str) -> dict | None:
    return next((p for p in PLANS if p["id"] == plan_id), None)
