from fastapi import APIRouter

router = APIRouter(tags=["cost"])

# Documented assumptions (principle: estimates must state their basis).
# Replace with live AWS Pricing API lookups once a real account is connected.
ASSUMPTIONS = {
    "instance_hourly_cost": 11.8,
    "currency": "INR",
    "region": "ap-south-1",
    "source": "documented assumption — not a live AWS Pricing API call",
}


@router.get("/api/cost/compare")
def compare_strategies():
    return [
        {"strategy": "do_nothing", "resource_count": 4, "estimated_capacity": 10000,
         "estimated_cost_per_hour": 48, "predicted_errors": "high", "assumptions": ASSUMPTIONS},
        {"strategy": "scale_immediately", "resource_count": 12, "estimated_capacity": 30000,
         "estimated_cost_per_hour": 190, "predicted_errors": "low", "assumptions": ASSUMPTIONS},
        {"strategy": "gradual_scaling", "resource_count": "4 → 12 over 20m", "estimated_capacity": 30000,
         "estimated_cost_per_hour": 142, "predicted_errors": "moderate", "assumptions": ASSUMPTIONS},
        {"strategy": "optimization", "resource_count": "caching + async queue", "estimated_capacity": 26000,
         "estimated_cost_per_hour": 96, "predicted_errors": "low", "assumptions": ASSUMPTIONS},
    ]
