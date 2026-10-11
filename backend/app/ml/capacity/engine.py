"""
Capacity + bottleneck engine — sections 22–23 of the spec.

Required-capacity math is always based on a measured (or explicitly
documented) per-unit capacity assumption — never a hard-coded
"universal truth", per principle in section 22.
"""
import math
from dataclasses import dataclass


@dataclass
class CapacityPlan:
    current_capacity_rpm: float
    predicted_demand_rpm: float
    required_instances: int
    additional_instances: int
    assumption_rpm_per_instance: float


def required_capacity(
    predicted_demand_rpm: float,
    current_instances: int,
    measured_rpm_per_instance: float,
) -> CapacityPlan:
    current_capacity = current_instances * measured_rpm_per_instance
    required_instances = max(current_instances, math.ceil(predicted_demand_rpm / measured_rpm_per_instance))
    return CapacityPlan(
        current_capacity_rpm=current_capacity,
        predicted_demand_rpm=predicted_demand_rpm,
        required_instances=required_instances,
        additional_instances=max(0, required_instances - current_instances),
        assumption_rpm_per_instance=measured_rpm_per_instance,
    )


@dataclass
class BottleneckFinding:
    constraint_type: str
    current_value: float
    limit_value: float
    trend: str          # rising | falling | stable
    eta_minutes: float | None
    evidence: dict


def eta_to_limit(current: float, limit: float, rate_per_minute: float) -> float | None:
    """Minutes until `current` reaches `limit` at the given rate. None if never / already past."""
    if rate_per_minute <= 0 or current >= limit:
        return None
    return round((limit - current) / rate_per_minute, 1)


def find_bottleneck(
    constraint_type: str,
    current: float,
    limit: float,
    recent_series: list[float],
    step_minutes: float,
) -> BottleneckFinding:
    if len(recent_series) >= 2:
        rate = (recent_series[-1] - recent_series[0]) / (len(recent_series) * step_minutes)
    else:
        rate = 0.0

    trend = "rising" if rate > 0.05 else ("falling" if rate < -0.05 else "stable")
    eta = eta_to_limit(current, limit, rate) if trend == "rising" else None

    return BottleneckFinding(
        constraint_type=constraint_type,
        current_value=current,
        limit_value=limit,
        trend=trend,
        eta_minutes=eta,
        evidence={
            "recent_values": recent_series[-6:],
            "rate_per_minute": round(rate, 3),
            "utilization_pct": round((current / limit) * 100, 1) if limit else None,
        },
    )
