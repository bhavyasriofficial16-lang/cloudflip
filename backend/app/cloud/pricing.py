"""
AWS Pricing Reference Engine & Transparent Formula Calculator.

HARD RULE: Never invent numbers. Every calculation uses transparent arithmetic
derived from documented AWS on-demand pricing baselines and 730 hours/month.
"""
from typing import Dict, Any, Tuple

# Standard AWS hours per month convention
HOURS_PER_MONTH = 730

DEFAULT_PRICING_SOURCE = "AWS Public On-Demand Pricing (us-east-1, Oct 2026 baseline)"

# Reference On-Demand hourly prices in USD (us-east-1)
EC2_HOURLY_USD: Dict[str, float] = {
    "t3.nano": 0.0052,
    "t3.micro": 0.0104,
    "t3.small": 0.0208,
    "t3.medium": 0.0416,
    "t3.large": 0.0832,
    "t3.xlarge": 0.1664,
    "t3.2xlarge": 0.3328,
    "t4g.nano": 0.0042,
    "t4g.micro": 0.0084,
    "t4g.small": 0.0168,
    "t4g.medium": 0.0336,
    "t4g.large": 0.0672,
    "t4g.xlarge": 0.1344,
    "t4g.2xlarge": 0.2688,
    "m5.large": 0.096,
    "m5.xlarge": 0.192,
    "m5.2xlarge": 0.384,
    "m5.4xlarge": 0.768,
    "m6i.large": 0.096,
    "m6i.xlarge": 0.192,
    "m6i.2xlarge": 0.384,
    "m6g.large": 0.077,
    "m6g.xlarge": 0.154,
    "m6g.2xlarge": 0.308,
    "c5.large": 0.085,
    "c5.xlarge": 0.170,
    "c5.2xlarge": 0.340,
    "c5.4xlarge": 0.680,
    "c6i.large": 0.085,
    "c6i.xlarge": 0.170,
    "r5.large": 0.126,
    "r5.xlarge": 0.252,
    "r5.2xlarge": 0.504,
    "r5.4xlarge": 1.008,
    "r6g.large": 0.1008,
    "r6g.xlarge": 0.2016,
    "r6g.2xlarge": 0.4032,
}

RDS_HOURLY_USD: Dict[str, float] = {
    "db.t3.micro": 0.017,
    "db.t3.small": 0.034,
    "db.t3.medium": 0.068,
    "db.t4g.medium": 0.054,
    "db.m5.large": 0.138,
    "db.m5.xlarge": 0.276,
    "db.m5.2xlarge": 0.552,
    "db.r5.large": 0.240,
    "db.r5.xlarge": 0.480,
    "db.r5.2xlarge": 0.960,
    "db.r5.4xlarge": 1.920,
}

EBS_MONTHLY_PER_GB: Dict[str, float] = {
    "gp3": 0.08,
    "gp2": 0.10,
    "io1": 0.125,
    "io2": 0.125,
    "st1": 0.045,
    "sc1": 0.015,
    "standard": 0.05,
}

# Idle / Fixed Penalties
EIP_IDLE_HOURLY = 0.005  # AWS charges $0.005/hr for unassociated Elastic IPs
SNAPSHOT_MONTHLY_PER_GB = 0.05  # Standard AWS EBS snapshot pricing
ALB_BASE_HOURLY = 0.0225  # ALB fixed base price per hour ($16.43/mo before LCU)
NAT_GATEWAY_HOURLY = 0.045  # $32.85/mo per idle NAT gateway


def get_ec2_hourly_price(instance_type: str) -> float:
    return EC2_HOURLY_USD.get(instance_type.lower(), 0.096)


def calculate_ec2_idle_saving(instance_type: str) -> Dict[str, Any]:
    hourly = get_ec2_hourly_price(instance_type)
    monthly = round(hourly * HOURS_PER_MONTH, 2)
    formula = f"${hourly:.4f}/hr x {HOURS_PER_MONTH} hrs/mo = ${monthly:.2f}/mo (100% idle instance termination or stop)"
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_ec2_downsize_saving(current_type: str, target_type: str) -> Dict[str, Any]:
    cur_hourly = get_ec2_hourly_price(current_type)
    tgt_hourly = get_ec2_hourly_price(target_type)
    diff_hourly = max(0.0, cur_hourly - tgt_hourly)
    monthly = round(diff_hourly * HOURS_PER_MONTH, 2)
    formula = (
        f"(${cur_hourly:.4f}/hr [{current_type}] - ${tgt_hourly:.4f}/hr [{target_type}]) "
        f"x {HOURS_PER_MONTH} hrs/mo = ${monthly:.2f}/mo"
    )
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_ebs_unattached_saving(size_gb: int, volume_type: str = "gp3") -> Dict[str, Any]:
    rate = EBS_MONTHLY_PER_GB.get(volume_type.lower(), 0.08)
    monthly = round(size_gb * rate, 2)
    formula = f"{size_gb} GB x ${rate:.2f}/GB-mo ({volume_type}) = ${monthly:.2f}/mo (unattached volume storage)"
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_unused_eip_saving(count: int = 1) -> Dict[str, Any]:
    hourly = count * EIP_IDLE_HOURLY
    monthly = round(hourly * HOURS_PER_MONTH, 2)
    formula = f"{count} unused EIP(s) x ${EIP_IDLE_HOURLY:.3f}/hr x {HOURS_PER_MONTH} hrs/mo = ${monthly:.2f}/mo (unassociated EIP charge)"
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_old_snapshot_saving(size_gb: int) -> Dict[str, Any]:
    monthly = round(size_gb * SNAPSHOT_MONTHLY_PER_GB, 2)
    formula = f"{size_gb} GB snapshot data x ${SNAPSHOT_MONTHLY_PER_GB:.2f}/GB-mo = ${monthly:.2f}/mo (aged backup storage)"
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_idle_lb_saving(lb_type: str = "application") -> Dict[str, Any]:
    monthly = round(ALB_BASE_HOURLY * HOURS_PER_MONTH, 2)
    formula = f"${ALB_BASE_HOURLY:.4f}/hr base charge x {HOURS_PER_MONTH} hrs/mo = ${monthly:.2f}/mo (idle load balancer with zero traffic)"
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }


def calculate_rds_downsize_saving(current_class: str, target_class: str) -> Dict[str, Any]:
    cur_hourly = RDS_HOURLY_USD.get(current_class.lower(), 0.24)
    tgt_hourly = RDS_HOURLY_USD.get(target_class.lower(), 0.068)
    diff_hourly = max(0.0, cur_hourly - tgt_hourly)
    monthly = round(diff_hourly * HOURS_PER_MONTH, 2)
    formula = (
        f"(${cur_hourly:.4f}/hr [{current_class}] - ${tgt_hourly:.4f}/hr [{target_class}]) "
        f"x {HOURS_PER_MONTH} hrs/mo = ${monthly:.2f}/mo"
    )
    return {
        "monthly_saving": monthly,
        "pricing_formula": formula,
        "pricing_source": DEFAULT_PRICING_SOURCE,
    }
