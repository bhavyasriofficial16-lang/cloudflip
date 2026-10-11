from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, Field


class ResourceOut(BaseModel):
    id: str
    aws_resource_id: str
    resource_type: str
    name: str
    region: str
    availability_zone: Optional[str] = None
    status: str
    tags: dict = {}
    resource_metadata: dict = {}

    class Config:
        from_attributes = True


class MetricPoint(BaseModel):
    metric_name: str
    value: float
    unit: Optional[str] = None
    is_synthetic: bool = True
    timestamp: datetime


class AnomalyOut(BaseModel):
    id: str
    resource_id: str
    metric_name: str
    current_value: float
    baseline_value: float
    deviation_sigma: float
    severity: str
    method: str
    detected_at: datetime

    class Config:
        from_attributes = True


class PredictionOut(BaseModel):
    metric_name: str
    horizon_minutes: int
    predicted_value: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None
    model_name: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mape: Optional[float] = None


class BottleneckOut(BaseModel):
    id: str
    resource_id: str
    constraint_type: str
    current_value: float
    limit_value: float
    trend: str
    eta_minutes: Optional[float] = None
    evidence: dict = {}

    class Config:
        from_attributes = True


class SimulationRequest(BaseModel):
    traffic_multiplier: float = Field(ge=1, le=10)
    horizon_minutes: int = Field(ge=5, le=60)
    current_instances: int = Field(ge=1, le=200)
    per_instance_capacity_rpm: float = 2500.0
    baseline_traffic_rpm: float = 8000.0


class SimulationResult(BaseModel):
    id: str
    predicted_traffic_rpm: float
    current_capacity_rpm: float
    required_instances: int
    projected_cpu_pct: float
    projected_latency_ms: float
    projected_error_rate_pct: float
    bottleneck: str
    estimated_additional_cost_per_hour: float
    note: str = "Simulation only — no AWS resources were changed."


class RecommendationOut(BaseModel):
    id: str
    resource_id: str
    title: str
    current_state: dict
    recommended_state: dict
    reason: str
    evidence: list[str]
    estimated_cost_per_hour: Optional[float] = None
    confidence: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationDecision(BaseModel):
    approve: bool


class ActionOut(BaseModel):
    id: str
    resource_id: str
    action_type: str
    previous_state: dict
    requested_state: dict
    approval_status: str
    executed: bool
    execution_result: Optional[str] = None
    is_simulated: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VerificationOut(BaseModel):
    action_id: str
    metrics_before: dict
    metrics_after: dict
    result: str
    verified_at: datetime

    class Config:
        from_attributes = True


class CostEstimateOut(BaseModel):
    strategy: str
    resource_count: Optional[int] = None
    estimated_capacity: Optional[float] = None
    estimated_cost_per_hour: float
    assumptions: dict = {}


class ActivityOut(BaseModel):
    timestamp: datetime
    event: str
    resource_id: Optional[str] = None
    result: Optional[str] = None

    class Config:
        from_attributes = True


class DiscoverRequest(BaseModel):
    region: str = "ap-south-1"
