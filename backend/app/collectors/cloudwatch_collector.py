"""
CloudWatch collector — section 16 of the spec.

In live mode, call `collect_and_store()` on a schedule (e.g. a
background task or a small cron container) to pull real metrics and
write them as ResourceMetric rows with is_synthetic=False.
In demo mode this module is unused — app/services/local_metrics_simulator.py
feeds the UI instead.
"""
from sqlalchemy.orm import Session

from app.cloud.aws_client import aws_client
from app.models import models as m

# resource_type -> (CloudWatch namespace, metric name, dimension name)
METRIC_MAP = {
    "EC2": ("AWS/EC2", "CPUUtilization", "InstanceId"),
    "RDS": ("AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier"),
    "SQS": ("AWS/SQS", "ApproximateAgeOfOldestMessage", "QueueName"),
}


def collect_and_store(db: Session) -> int:
    stored = 0
    resources = db.query(m.Resource).all()
    for r in resources:
        mapping = METRIC_MAP.get(r.resource_type)
        if not mapping:
            continue
        namespace, metric_name, dim_name = mapping
        points = aws_client.get_cloudwatch_metric(
            namespace=namespace, metric_name=metric_name,
            dimensions=[{"Name": dim_name, "Value": r.aws_resource_id}],
        )
        for p in points:
            db.add(m.ResourceMetric(
                resource_id=r.id, metric_name=metric_name,
                value=p["value"], is_synthetic=False,
            ))
            stored += 1
    db.commit()
    return stored
