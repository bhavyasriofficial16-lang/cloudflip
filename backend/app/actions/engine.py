"""
Action engine — sections 29–30 of the spec.

execute_action() is only ever called after a Recommendation has been
explicitly approved (see api/recommendations.py). It never runs
autonomously. Every call is logged by the caller into ActivityLog.
"""
from app.cloud.aws_client import aws_client
from app.config.settings import get_settings

settings = get_settings()


def execute_scale_action(asg_name: str, desired_instances: int) -> dict:
    """
    Returns a dict describing what happened — always truthful about
    whether a real AWS call was made vs. simulated.
    """
    result = aws_client.set_asg_desired_capacity(asg_name, desired_instances)
    return {
        "is_simulated": result.get("simulated", True) or settings.simulation_only_mode,
        "execution_result": result.get("message", "unknown"),
    }
