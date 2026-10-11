"""
Recommendation engine — section 28 of the spec.

Every recommendation this produces carries its evidence list — the
same numbers a human could check against Live Metrics / Predictions —
so nothing here is a bare LLM claim (principle #7/#8 in the spec).
"""
from dataclasses import dataclass, field


@dataclass
class RecommendationDraft:
    resource_id: str
    title: str
    current_state: dict
    recommended_state: dict
    reason: str
    evidence: list[str] = field(default_factory=list)
    estimated_cost_per_hour: float | None = None
    confidence: str = "medium"   # low | medium | high


def confidence_from_forecast(mape: float | None) -> str:
    if mape is None:
        return "medium"
    if mape < 6:
        return "high"
    if mape < 15:
        return "medium"
    return "low"


def build_scale_recommendation(
    resource_id: str,
    resource_name: str,
    current_instances: int,
    required_instances: int,
    predicted_demand_rpm: float,
    current_capacity_rpm: float,
    growth_rate_pct: float,
    cpu_trend: tuple[float, float],
    cost_per_hour: float,
    forecast_mape: float | None = None,
) -> RecommendationDraft | None:
    if required_instances <= current_instances:
        return None

    return RecommendationDraft(
        resource_id=resource_id,
        title=f"Scale {resource_name}",
        current_state={"instances": current_instances},
        recommended_state={"instances": required_instances},
        reason="Traffic is predicted to exceed current measured capacity.",
        evidence=[
            f"Traffic growth rate: +{growth_rate_pct:.0f}% over the recent window",
            f"Projected demand: {predicted_demand_rpm:,.0f} req/min",
            f"CPU trend: {cpu_trend[0]:.0f}% → {cpu_trend[1]:.0f}% over the last hour",
            f"Current measured capacity: {current_capacity_rpm:,.0f} req/min",
        ],
        estimated_cost_per_hour=cost_per_hour,
        confidence=confidence_from_forecast(forecast_mape),
    )


def build_connection_pool_recommendation(
    resource_id: str,
    resource_name: str,
    current_limit: int,
    current_value: float,
    eta_minutes: float | None,
    headroom_multiplier: float = 1.6,
) -> RecommendationDraft:
    recommended_limit = round(current_limit * headroom_multiplier)
    eta_text = f"~{eta_minutes:.0f} minutes" if eta_minutes else "not yet imminent"
    return RecommendationDraft(
        resource_id=resource_id,
        title=f"Increase {resource_name} connection pool headroom",
        current_state={"max_connections": current_limit},
        recommended_state={"max_connections": recommended_limit},
        reason="Connections are approaching the measured limit and trending upward.",
        evidence=[
            f"Current: {current_value:.0f} / {current_limit} connections",
            f"ETA to limit: {eta_text} at current trend",
        ],
        estimated_cost_per_hour=None,
        confidence="medium",
    )
