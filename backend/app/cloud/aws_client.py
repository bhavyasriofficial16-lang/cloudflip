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

    def discover_asg(self, role_arn: Optional[str] = None, region: Optional[str] = None) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        try:
            session = self.get_session(region=region, role_arn=role_arn)
            asg_client = session.client("autoscaling")
            resp = asg_client.describe_auto_scaling_groups()
            out = []
            for group in resp.get("AutoScalingGroups", []):
                out.append({
                    "aws_resource_id": group["AutoScalingGroupName"],
                    "name": group["AutoScalingGroupName"],
                    "resource_type": "ASG",
                    "region": region or settings.aws_region,
                    "status": "healthy",
                    "metadata": {
                        "min_size": group.get("MinSize"),
                        "max_size": group.get("MaxSize"),
                        "desired_capacity": group.get("DesiredCapacity"),
                        "default_cooldown": group.get("DefaultCooldown"),
                        "availability_zones": group.get("AvailabilityZones", []),
                        "vpc_zone_identifier": group.get("VPCZoneIdentifier"),
                        "instances": len(group.get("Instances", [])),
                    }
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering Auto Scaling Groups: {e}")
            return []

    def discover_ebs_volumes(self, role_arn: Optional[str] = None, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """Read-only discovery of EBS volumes (identifying unattached volumes)."""
        if not self.enabled:
            return []
        try:
            session = self.get_session(region=region, role_arn=role_arn)
            ec2 = session.client("ec2")
            resp = ec2.describe_volumes()
            out = []
            for vol in resp.get("Volumes", []):
                tags = {t["Key"]: t["Value"] for t in vol.get("Tags", [])}
                attachments = vol.get("Attachments", [])
                out.append({
                    "volume_id": vol["VolumeId"],
                    "name": tags.get("Name", vol["VolumeId"]),
                    "size_gb": vol.get("Size", 0),
                    "volume_type": vol.get("VolumeType", "gp3"),
                    "state": vol.get("State"),  # 'available' means unattached
                    "create_time": vol.get("CreateTime").isoformat() if vol.get("CreateTime") else None,
                    "is_attached": len(attachments) > 0,
                    "attachments": attachments,
                    "tags": tags,
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering EBS volumes: {e}")
            return []

    def discover_elastic_ips(self, role_arn: Optional[str] = None, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """Read-only discovery of Elastic IPs (identifying unassociated IPs)."""
        if not self.enabled:
            return []
        try:
            session = self.get_session(region=region, role_arn=role_arn)
            ec2 = session.client("ec2")
            resp = ec2.describe_addresses()
            out = []
            for addr in resp.get("Addresses", []):
                tags = {t["Key"]: t["Value"] for t in addr.get("Tags", [])}
                is_associated = bool(addr.get("AssociationId") or addr.get("InstanceId"))
                out.append({
                    "allocation_id": addr.get("AllocationId", addr.get("PublicIp")),
                    "public_ip": addr.get("PublicIp"),
                    "name": tags.get("Name", addr.get("PublicIp")),
                    "is_associated": is_associated,
                    "instance_id": addr.get("InstanceId"),
                    "network_interface_id": addr.get("NetworkInterfaceId"),
                    "tags": tags,
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering Elastic IPs: {e}")
            return []

    def discover_snapshots(self, role_arn: Optional[str] = None, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """Read-only discovery of self-owned EBS snapshots."""
        if not self.enabled:
            return []
        try:
            session = self.get_session(region=region, role_arn=role_arn)
            ec2 = session.client("ec2")
            resp = ec2.describe_snapshots(OwnerIds=["self"])
            out = []
            for snap in resp.get("Snapshots", []):
                tags = {t["Key"]: t["Value"] for t in snap.get("Tags", [])}
                out.append({
                    "snapshot_id": snap["SnapshotId"],
                    "volume_id": snap.get("VolumeId"),
                    "size_gb": snap.get("VolumeSize", 0),
                    "start_time": snap.get("StartTime").isoformat() if snap.get("StartTime") else None,
                    "description": snap.get("Description", ""),
                    "state": snap.get("State"),
                    "tags": tags,
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering snapshots: {e}")
            return []

    def discover_load_balancers(self, role_arn: Optional[str] = None, region: Optional[str] = None) -> List[Dict[str, Any]]:
        """Read-only discovery of Application / Network Load Balancers."""
        if not self.enabled:
            return []
        try:
            session = self.get_session(region=region, role_arn=role_arn)
            elbv2 = session.client("elbv2")
            resp = elbv2.describe_load_balancers()
            out = []
            for lb in resp.get("LoadBalancers", []):
                out.append({
                    "load_balancer_arn": lb["LoadBalancerArn"],
                    "name": lb["LoadBalancerName"],
                    "dns_name": lb.get("DNSName"),
                    "type": lb.get("Type", "application"),
                    "scheme": lb.get("Scheme"),
                    "state": lb.get("State", {}).get("Code"),
                    "created_time": lb.get("CreatedTime").isoformat() if lb.get("CreatedTime") else None,
                })
            return out
        except Exception as e:
            logger.error(f"Error discovering load balancers: {e}")
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
