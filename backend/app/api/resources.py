from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database.session import get_db
from app.models import models as m
from app.schemas import schemas as s

router = APIRouter(tags=["resources"])


class DiscoverRequestPayload(BaseModel):
    region: Optional[str] = "ap-south-1"
    role_arn: Optional[str] = None


@router.get("/api/resources", response_model=list[s.ResourceOut])
def list_resources(db: Session = Depends(get_db)):
    return db.query(m.Resource).all()


@router.get("/api/resources/{resource_id}", response_model=s.ResourceOut)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    r = db.query(m.Resource).filter_by(id=resource_id).first()
    if not r:
        raise HTTPException(404, "Resource not found")
    return r


@router.get("/api/dependencies")
def list_dependencies(db: Session = Depends(get_db)):
    deps = db.query(m.Dependency).all()
    return [
        {
            "id": d.id,
            "source_resource_id": d.source_resource_id,
            "target_resource_id": d.target_resource_id,
            "relationship_type": d.relationship_type,
            "inferred": d.inferred,
            "confidence": d.confidence,
        }
        for d in deps
    ]


@router.post("/api/aws/discover")
def discover(payload: Optional[DiscoverRequestPayload] = None, db: Session = Depends(get_db)):
    """
    Enumerates real EC2, ASG, and RDS resources from AWS using the configured AWS credentials/IAM Role.
    Saves discovered resources to the CloudFlip database.
    """
    from app.config.settings import get_settings
    from app.cloud.aws_client import aws_client

    settings = get_settings()

    if not settings.use_real_aws:
        count = db.query(m.Resource).count()
        return {"mode": "demo", "message": "Demo mode — showing seeded demo inventory.", "resource_count": count}

    # Discover resources across EC2, ASG, and RDS
    ec2_resources = aws_client.discover_ec2()
    asg_resources = aws_client.discover_asg()
    rds_resources = aws_client.discover_rds()

    all_discovered = ec2_resources + asg_resources + rds_resources

    # Persist discovered resources to DB if new
    saved_count = 0
    for res_data in all_discovered:
        existing = db.query(m.Resource).filter_by(aws_resource_id=res_data["aws_resource_id"]).first()
        if not existing:
            new_res = m.Resource(
                id=res_data["aws_resource_id"],
                aws_resource_id=res_data["aws_resource_id"],
                name=res_data.get("name", res_data["aws_resource_id"]),
                resource_type=res_data["resource_type"],
                region=res_data.get("region", settings.aws_region),
                status=res_data.get("status", "healthy"),
                tags=res_data.get("tags", {}),
                resource_metadata=res_data.get("metadata", {}),
            )
            db.add(new_res)
            saved_count += 1

    if saved_count > 0:
        db.commit()

    return {
        "mode": "live",
        "region": settings.aws_region,
        "discovered_total": len(all_discovered),
        "newly_saved": saved_count,
        "ec2_count": len(ec2_resources),
        "asg_count": len(asg_resources),
        "rds_count": len(rds_resources),
        "message": f"Successfully discovered {len(all_discovered)} real AWS resources.",
    }
