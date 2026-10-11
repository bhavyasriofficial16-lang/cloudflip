"""
Seeds a demo user, cloud account, and the 8 supported resource types
with a realistic status so the API and frontend have something to
show immediately after `docker-compose up`, with no AWS account
required (matches the "Try Demo Environment" onboarding path).
"""
from sqlalchemy.orm import Session

from app.models import models as m


DEMO_RESOURCES = [
    ("web-asg-1", "ASG", "critical"),
    ("api-ec2-2", "EC2", "healthy"),
    ("orders-rds", "RDS", "warning"),
    ("orders-sqs", "SQS", "healthy"),
    ("assets-s3", "S3", "healthy"),
    ("checkout-lambda", "Lambda", "healthy"),
    ("public-elb", "ELB", "healthy"),
    ("worker-ecs", "ECS", "critical"),
]


def seed(db: Session) -> None:
    existing = db.query(m.User).filter_by(email="demo@cloudflip.ai").first()
    if existing:
        return  # already seeded

    user = m.User(email="demo@cloudflip.ai", full_name="Demo User")
    db.add(user)
    db.flush()

    account = m.CloudAccount(
        user_id=user.id,
        environment=m.EnvironmentType.demo,
        default_region="ap-south-1",
    )
    db.add(account)
    db.flush()

    resources = {}
    for name, rtype, status in DEMO_RESOURCES:
        r = m.Resource(
            cloud_account_id=account.id,
            aws_resource_id=f"demo-{name}",
            resource_type=rtype,
            name=name,
            region="ap-south-1",
            availability_zone="ap-south-1a",
            status=status,
            tags={"env": "demo"},
        )
        db.add(r)
        db.flush()
        resources[name] = r

    dependency_pairs = [
        ("public-elb", "api-ec2-2"),
        ("public-elb", "web-asg-1"),
        ("api-ec2-2", "orders-rds"),
        ("web-asg-1", "orders-sqs"),
        ("orders-sqs", "worker-ecs"),
    ]
    for src, dst in dependency_pairs:
        db.add(m.Dependency(
            source_resource_id=resources[src].id,
            target_resource_id=resources[dst].id,
            inferred=True,
            confidence=0.85,
        ))

    db.add(m.ActivityLog(user_id=user.id, event="AWS discovery run", result=f"{len(resources)} resources found"))
    db.commit()
