"""
Database models — one class per table in the spec's data-model section:
User, CloudAccount, Resource, ResourceMetric, Dependency, Anomaly,
Prediction, Bottleneck, Simulation, Recommendation, Action,
ActionVerification, CostEstimate, ActivityLog, SurgeEvent.
"""
import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship

from app.database.session import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class EnvironmentType(str, enum.Enum):
    demo = "demo"
    live = "live"


class ResourceStatus(str, enum.Enum):
    healthy = "healthy"
    warning = "warning"
    critical = "critical"
    unknown = "unknown"


class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ActionResult(str, enum.Enum):
    success = "SUCCESS"
    partial = "PARTIAL"
    no_improvement = "NO_IMPROVEMENT"
    unknown = "UNKNOWN"


class PlanTier(str, enum.Enum):
    free = "free"
    pro_monthly = "pro_monthly"
    pro_annual = "pro_annual"
    pay_as_you_go = "pay_as_you_go"


class SubscriptionStatus(str, enum.Enum):
    none = "none"
    active = "active"
    trialing = "trialing"
    past_due = "past_due"
    canceled = "canceled"


class AutoRemediationMode(str, enum.Enum):
    off = "OFF"
    semi_autonomous = "SEMI_AUTONOMOUS"
    full_autonomous = "FULL_AUTONOMOUS"


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    supabase_uid = Column(String, unique=True, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- billing (Stripe & Razorpay) ---
    plan = Column(Enum(PlanTier), default=PlanTier.free)
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.none)
    payment_gateway = Column(String, default="stripe")  # "stripe" | "razorpay"
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_subscription_id = Column(String, nullable=True)
    razorpay_customer_id = Column(String, nullable=True, index=True)
    razorpay_subscription_id = Column(String, nullable=True)
    razorpay_order_id = Column(String, nullable=True)
    current_period_end = Column(DateTime, nullable=True)

    # --- autonomous ai remediation agent settings ---
    auto_remediation_mode = Column(Enum(AutoRemediationMode), default=AutoRemediationMode.off)
    auto_remediation_confidence_threshold = Column(Float, default=0.85)
    auto_remediation_max_cost_impact = Column(Float, default=500.0)

    cloud_accounts = relationship("CloudAccount", back_populates="owner")


class UsageRecord(Base):
    """One row per billing-relevant unit of usage, for the pay-as-you-go plan.
    A scheduled job sums unreported rows and reports them to Stripe as
    metered usage (see app/billing/metering.py)."""
    __tablename__ = "usage_records"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=True)
    quantity = Column(Integer, default=1)          # e.g. 1 resource-hour
    reported_to_stripe = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CloudAccount(Base):
    __tablename__ = "cloud_accounts"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    environment = Column(Enum(EnvironmentType), default=EnvironmentType.demo)
    aws_account_id = Column(String, nullable=True)
    default_region = Column(String, default="ap-south-1")
    role_arn = Column(String, nullable=True)     # least-privilege IAM role, never root creds
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="cloud_accounts")
    resources = relationship("Resource", back_populates="cloud_account")


class Resource(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, default=gen_uuid)
    cloud_account_id = Column(String, ForeignKey("cloud_accounts.id"), nullable=False)
    aws_resource_id = Column(String, nullable=False, index=True)
    resource_type = Column(String, nullable=False)   # EC2 | ECS | RDS | S3 | ELB | SQS | ASG | Lambda
    name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    availability_zone = Column(String, nullable=True)
    status = Column(Enum(ResourceStatus), default=ResourceStatus.unknown)
    tags = Column(JSON, default=dict)
    resource_metadata = Column(JSON, default=dict)
    discovered_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cloud_account = relationship("CloudAccount", back_populates="resources")
    metrics = relationship("ResourceMetric", back_populates="resource")


class ResourceMetric(Base):
    __tablename__ = "resource_metrics"
    id = Column(String, primary_key=True, default=gen_uuid)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False, index=True)
    metric_name = Column(String, nullable=False)     # cpu_utilization | db_connections | queue_depth | ...
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=True)
    is_synthetic = Column(Boolean, default=True)      # False once backed by real CloudWatch data
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    resource = relationship("Resource", back_populates="metrics")


class Dependency(Base):
    __tablename__ = "dependencies"
    id = Column(String, primary_key=True, default=gen_uuid)
    source_resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    target_resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    relationship_type = Column(String, default="depends_on")
    inferred = Column(Boolean, default=True)   # True unless derived from confirmed infra data
    confidence = Column(Float, default=0.5)
    created_at = Column(DateTime, default=datetime.utcnow)


class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(String, primary_key=True, default=gen_uuid)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    metric_name = Column(String, nullable=False)
    current_value = Column(Float, nullable=False)
    baseline_value = Column(Float, nullable=False)
    deviation_sigma = Column(Float, nullable=False)
    severity = Column(Enum(Severity), default=Severity.low)
    detected_at = Column(DateTime, default=datetime.utcnow)
    method = Column(String, default="zscore")   # zscore | ewma | isolation_forest


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(String, primary_key=True, default=gen_uuid)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=True)
    metric_name = Column(String, nullable=False)
    horizon_minutes = Column(Integer, nullable=False)
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    model_name = Column(String, default="exponential_smoothing")
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Bottleneck(Base):
    __tablename__ = "bottlenecks"
    id = Column(String, primary_key=True, default=gen_uuid)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    constraint_type = Column(String, nullable=False)   # cpu | memory | db_connections | queue_depth | ...
    current_value = Column(Float, nullable=False)
    limit_value = Column(Float, nullable=False)
    trend = Column(String, default="stable")           # rising | falling | stable
    eta_minutes = Column(Float, nullable=True)
    evidence = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class Simulation(Base):
    __tablename__ = "simulations"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    traffic_multiplier = Column(Float, nullable=False)
    horizon_minutes = Column(Integer, nullable=False)
    current_instances = Column(Integer, nullable=False)
    result = Column(JSON, default=dict)   # projected cpu/latency/errors/capacity/cost
    created_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(String, primary_key=True, default=gen_uuid)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    title = Column(String, nullable=False)
    current_state = Column(JSON, default=dict)
    recommended_state = Column(JSON, default=dict)
    reason = Column(Text, nullable=False)
    evidence = Column(JSON, default=list)
    estimated_cost_per_hour = Column(Float, nullable=True)
    confidence = Column(String, default="medium")   # low | medium | high
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)
    decided_by = Column(String, ForeignKey("users.id"), nullable=True)


class Action(Base):
    __tablename__ = "actions"
    id = Column(String, primary_key=True, default=gen_uuid)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), nullable=True)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action_type = Column(String, nullable=False)      # modify_asg_capacity | restart_service | ...
    previous_state = Column(JSON, default=dict)
    requested_state = Column(JSON, default=dict)
    approval_status = Column(Enum(ApprovalStatus), default=ApprovalStatus.pending)
    executed = Column(Boolean, default=False)
    execution_result = Column(String, nullable=True)   # raw AWS API result / error
    is_simulated = Column(Boolean, default=True)        # False only if it hit real AWS
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)


class ActionVerification(Base):
    __tablename__ = "action_verifications"
    id = Column(String, primary_key=True, default=gen_uuid)
    action_id = Column(String, ForeignKey("actions.id"), nullable=False)
    metrics_before = Column(JSON, default=dict)
    metrics_after = Column(JSON, default=dict)
    result = Column(Enum(ActionResult), default=ActionResult.unknown)
    verified_at = Column(DateTime, default=datetime.utcnow)


class CostEstimate(Base):
    __tablename__ = "cost_estimates"
    id = Column(String, primary_key=True, default=gen_uuid)
    strategy = Column(String, nullable=False)   # do_nothing | scale_immediately | gradual | optimization
    resource_count = Column(Integer, nullable=True)
    estimated_capacity = Column(Float, nullable=True)
    estimated_cost_per_hour = Column(Float, nullable=False)
    assumptions = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_log"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    event = Column(String, nullable=False)
    resource_id = Column(String, ForeignKey("resources.id"), nullable=True)
    result = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class SurgeEvent(Base):
    __tablename__ = "surge_events"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    expected_multiplier = Column(Float, nullable=False)
    is_user_assumption = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
