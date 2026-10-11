from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models import models as m
from app.schemas import schemas as s

router = APIRouter(tags=["activity"])


@router.get("/api/activity", response_model=list[s.ActivityOut])
def list_activity(db: Session = Depends(get_db), limit: int = 50):
    return (
        db.query(m.ActivityLog)
        .order_by(m.ActivityLog.timestamp.desc())
        .limit(limit)
        .all()
    )
