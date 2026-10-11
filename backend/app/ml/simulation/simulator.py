"""
What-if simulator — section 26 of the spec.

Pure function of its inputs. This module has no AWS client and makes
no network calls — it is structurally incapable of changing real
infrastructure, which is the guarantee the UI banner promises.
"""
import math
from dataclasses import dataclass


@dataclass
class SimulationOutcome:
    predicted_traffic_rpm: float
    current_capacity_rpm: float
    required_instances: int
    projected_cpu_pct: float
    projected_latency_ms: float
    projected_error_rate_pct: float
    bottleneck: str
    estimated_additional_cost_per_hour: float


# Documented assumption — replace with a measured value per instance type
# once real CloudWatch history exists (see docs/ARCHITECTURE.md).
DEFAULT_COST_PER_INSTANCE_HOUR = 11.8   # e.g. an m6i.large on-demand rate, ap-south-1, in the deployment's currency


def run_simulation(
    traffic_multiplier: float,
    horizon_minutes: int,
    current_instances: int,
    per_instance_capacity_rpm: float = 2500.0,
    baseline_traffic_rpm: float = 8000.0,
    cost_per_instance_hour: float = DEFAULT_COST_PER_INSTANCE_HOUR,
) -> SimulationOutcome:
    predicted_traffic = baseline_traffic_rpm * traffic_multiplier
    current_capacity = current_instances * per_instance_capacity_rpm

    required_instances = max(current_instances, math.ceil(predicted_traffic / per_instance_capacity_rpm))
    additional_instances = max(0, required_instances - current_instances)

    utilization = predicted_traffic / current_capacity if current_capacity else 0
    projected_cpu = min(99.0, round(utilization * 55, 1))   # 55% CPU ~ measured baseline at 1x utilization
    overload = max(0.0, predicted_traffic - current_capacity)
    projected_latency = round(180 + overload * 0.012, 0)
    projected_errors = round(min(18.0, (overload / current_capacity) * 100), 2) if current_capacity and overload > 0 else 0.1

    bottleneck = "Web tier capacity" if overload > 0 else "None projected"
    cost = round(additional_instances * cost_per_instance_hour, 2)

    return SimulationOutcome(
        predicted_traffic_rpm=round(predicted_traffic, 0),
        current_capacity_rpm=round(current_capacity, 0),
        required_instances=required_instances,
        projected_cpu_pct=projected_cpu,
        projected_latency_ms=projected_latency,
        projected_error_rate_pct=projected_errors,
        bottleneck=bottleneck,
        estimated_additional_cost_per_hour=cost,
    )
