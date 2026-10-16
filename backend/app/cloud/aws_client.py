"""
Thin AWS wrapper used by the discovery collector, metrics pipeline, and action engine.

Enforces:
  - Security: Never exposes AWS credentials to the frontend.
  - Least-privilege: Supports scoped IAM Roles (via STS AssumeRole) or Access Keys.
  - Test / Simulation mode: Safe default when use_real_aws is False.
"""
import logging
from typing import List, Dict, Any, Optional

from app.config.settings import get_settings

logger = logging.getLogger("cloudflip.aws_client")
settings = get_settings()


class AWSClient:
    def __init__(self):
        self.enabled = settings.use_real_aws
        self._session = None

    def get_session(self, region: Optional[str] = None, role_arn: Optional[str] = None):
        """
        Creates a boto3 session. If a role_arn is specified, uses STS AssumeRole
        for secure cross-account execution.
        """
        import boto3

        target_region = region or settings.aws_region or "us-east-1"
        target_role = role_arn or settings.aws_role_arn

        if target_role:
            logger.info(f"Assuming IAM Role: {target_role}")
            sts_client = boto3.client(
                "sts",
                aws_access_key_id=settings.aws_access_key_id or None,
                aws_secret_access_key=settings.aws_secret_access_key or None,
                region_name=target_region,
            )
            assumed_role_object = sts_client.assume_role(
                RoleArn=target_role,
                RoleSessionName="CloudFlipRemediationSession"
            )
            credentials = assumed_role_object["Credentials"]
            return boto3.Session(
                aws_access_key_id=credentials["AccessKeyId"],
                aws_secret_access_key=credentials["SecretAccessKey"],
                aws_session_token=credentials["SessionToken"],
                region_name=target_region,
            )
        else:
            return boto3.Session(
                aws_access_key_id=settings.aws_access_key_id or None,
                aws_secret_access_key=settings.aws_secret_access_key or None,
                region_name=target_region,
            )

    def test_connection(self, region: Optional[str] = None, role_arn: Optional[str] = None,
                        access_key_id: Optional[str] = None, secret_access_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates AWS connection by calling STS get_caller_identity.
        Returns AWS Account ID, ARN, and region.
        """
        import boto3

        target_region = region or settings.aws_region or "us-east-1"
        key_id = access_key_id or settings.aws_access_key_id or None
        secret_key = secret_access_key or settings.aws_secret_access_key or None
        arn = role_arn or settings.aws_role_arn or None

        if arn:
            sts_client = boto3.client("sts", aws_access_key_id=key_id, aws_secret_access_key=secret_key, region_name=target_region)
            assumed = sts_client.assume_role(RoleArn=arn, RoleSessionName="CloudFlipVerification")
            creds = assumed["Credentials"]
            verified_client = boto3.client("sts", aws_access_key_id=creds["AccessKeyId"], aws_secret_access_key=creds["SecretAccessKey"], aws_session_token=creds["SessionToken"], region_name=target_region)
            identity = verified_client.get_caller_identity()
        else:
            session = boto3.Session(aws_access_key_id=key_id, aws_secret_access_key=secret_key, region_name=target_region)
            sts_client = session.client("sts")
            identity = sts_client.get_caller_identity()

        return {
            "connected": True,
            "account_id": identity.get("Account"),
            "arn": identity.get("Arn"),
            "user_id": identity.get("UserId"),
            "region": target_region,
        }

    # ---- Real AWS Discovery -------------------------------------------------
    def discover_ec2(self) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        try:
            session = self.get_session()
            ec2 = session.client("ec2")
            resp = ec2.describe_instances()
            out = []
            for res in resp.get("Reservations", []):
                for inst in res.get("Instances", []):
                    tags = {t["Key"]: t["Value"] for t in inst.get("Tags", [])}
                    out.append({
                        "aws_resource_id": inst["InstanceId"],
                        "name": tags.get("Name", inst["InstanceId"]),
                        "resource_type": "EC2",
                        "region": settings.aws_region,
                        "availability_zone": inst.get("Placement", {}).get("AvailabilityZone"),
                        "status": "healthy" if inst.get("State", {}).get("Name") == "running" else "warning",
                        "tags": tags,
                        "metadata": {"instance_type": inst.get("InstanceType")},
                    })
            return out
        except Exception as e:
            logger.error(f"Error discovering EC2 instances: {e}")
            return []

    def discover_asg(self) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        try:
            session = self.get_session()
            asg_client = session.client("autoscaling")
            resp = asg_client.describe_auto_scaling_groups()
            out = []
            for group in resp.get("AutoScalingGroups", []):
                out.append({
                    "aws_resource_id": group["AutoScalingGroupName"],
                    "name": group["AutoScalingGroupName"],
                    "resource_type": "ASG",
                    "region": settings.aws_region,
                    "status": "healthy",
                    "metadata": {
                        "min_size": group.get("MinSize"),
                        "max_size": group.get("MaxSize"),
                        "desired_capacity": group.get("DesiredCapacity"),
                        "instances": len(group.get("Instances", [])),
                    }
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering Auto Scaling Groups: {e}")
            return []

    def discover_rds(self) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        try:
            session = self.get_session()
            rds = session.client("rds")
            resp = rds.describe_db_instances()
            out = []
            for db in resp.get("DBInstances", []):
                out.append({
                    "aws_resource_id": db["DBInstanceIdentifier"],
                    "name": db["DBInstanceIdentifier"],
                    "resource_type": "RDS",
                    "region": settings.aws_region,
                    "status": "healthy" if db.get("DBInstanceStatus") == "available" else "warning",
                    "metadata": {
                        "engine": db.get("Engine"),
                        "class": db.get("DBInstanceClass"),
                        "allocated_storage": db.get("AllocatedStorage"),
                    }
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering RDS DB instances: {e}")
            return []

    # ---- Actions -----------------------------------------------------
    def set_asg_desired_capacity(self, asg_name: str, desired: int) -> Dict[str, Any]:
        """Executes actual ASG scale action in AWS if simulation_only_mode is False."""
        if not self.enabled or settings.simulation_only_mode:
            return {"simulated": True, "message": f"Simulation Safety Active — target {asg_name} set to {desired} in test mode."}

        try:
            session = self.get_session()
            client = session.client("autoscaling")
            client.set_desired_capacity(
                AutoScalingGroupName=asg_name,
                DesiredCapacity=desired,
                HonorCooldown=False,
            )
            return {"simulated": False, "message": f"⚡ Real AWS ASG scale action executed: {asg_name} desired capacity set to {desired}."}
        except Exception as e:
            logger.error(f"Failed to set ASG capacity on AWS: {e}")
            return {"simulated": False, "message": f"AWS Execution Error: {str(e)}"}

    # ---- Metrics -------------------------------------------------------
    def get_cloudwatch_metric(self, namespace: str, metric_name: str, dimensions: List[Dict[str, str]],
                               stat: str = "Average", period_seconds: int = 60, minutes_back: int = 30) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        import datetime

        try:
            session = self.get_session()
            cw = session.client("cloudwatch")
            end = datetime.datetime.utcnow()
            start = end - datetime.timedelta(minutes=minutes_back)
            resp = cw.get_metric_statistics(
                Namespace=namespace, MetricName=metric_name, Dimensions=dimensions,
                StartTime=start, EndTime=end, Period=period_seconds, Statistics=[stat],
            )
            points = sorted(resp.get("Datapoints", []), key=lambda p: p["Timestamp"])
            return [{"timestamp": p["Timestamp"].isoformat(), "value": p[stat]} for p in points]
        except Exception as e:
            logger.error(f"Error getting CloudWatch metric {metric_name}: {e}")
            return []


aws_client = AWSClient()
