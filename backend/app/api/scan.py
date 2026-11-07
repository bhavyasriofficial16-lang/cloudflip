"""
Scan API Endpoints.

Provides:
- POST /api/scan/start: Triggers asynchronous read-only scan with progress tracking.
- GET  /api/scan/{scan_id}/status: Returns current progress percentage and step.
- GET  /api/scan/{scan_id}: Returns full scan run with categorized findings and evidence.
- GET  /api/scans: Lists historical scans for comparison over time.
- GET  /api/scan/sample: Provides instantaneous access to sample report (no auth required).
"""
import threading
import logging
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database.session import get_db, SessionLocal
from app.models import models as m
from app.schemas import schemas as s
from app.cloud.scanner import CloudScanner

logger = logging.getLogger("cloudflip.api.scan")
router = APIRouter(prefix="/api/scan", tags=["scan"])


def _run_scan_worker(scan_id: str, cloud_account_id: str | None, is_demo: bool):
    """Background worker executing the read-only scan pipeline."""
    db = SessionLocal()
    try:
        scanner = CloudScanner(db)
        scanner.execute_scan(scan_id=scan_id, cloud_account_id=cloud_account_id, is_demo=is_demo)
    except Exception as e:
        logger.error(f"Background scan worker failed for {scan_id}: {e}")
    finally:
        db.close()


@router.post("/start", response_model=s.ScanStatusOut)
def start_scan(
    payload: s.ScanStartRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Initiates a point-in-time savings & risk scan."""
    # Create scan record in pending state
    scan_run = m.ScanRun(
        cloud_account_id=payload.cloud_account_id,
        status="running",
        progress_percent=5,
        current_step="Initializing read-only scanner & validating IAM STS role",
        is_sample_or_simulation=payload.is_demo,
    )
    db.add(scan_run)
    db.commit()
    db.refresh(scan_run)

    # Launch background scanning task
    background_tasks.add_task(
        _run_scan_worker,
        scan_id=scan_run.id,
        cloud_account_id=payload.cloud_account_id,
        is_demo=payload.is_demo,
    )

    return s.ScanStatusOut(
        id=scan_run.id,
        status=scan_run.status,
        progress_percent=scan_run.progress_percent,
        current_step=scan_run.current_step,
        findings_count=0,
        total_monthly_waste=0.0,
        completed_at=None,
    )


@router.get("/{scan_id}/status", response_model=s.ScanStatusOut)
def get_scan_status(scan_id: str, db: Session = Depends(get_db)):
    """Polls real-time progress of an in-flight or completed scan."""
    scan = db.query(m.ScanRun).filter_by(id=scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan run not found")
    
    return s.ScanStatusOut(
        id=scan.id,
        status=scan.status,
        progress_percent=scan.progress_percent,
        current_step=scan.current_step,
        findings_count=scan.findings_count,
        total_monthly_waste=scan.total_monthly_waste,
        completed_at=scan.completed_at,
    )


@router.get("/sample", response_model=s.ScanRunOut)
def get_sample_scan(db: Session = Depends(get_db)):
    """Returns a realistic sample scan report without requiring AWS connection or login."""
    # Look for existing sample scan
    sample = (
        db.query(m.ScanRun)
        .filter_by(is_sample_or_simulation=True, status="completed")
        .order_by(m.ScanRun.created_at.desc() if hasattr(m.ScanRun, "created_at") else m.ScanRun.started_at.desc())
        .first()
    )
    if sample and sample.findings:
        return sample

    # Create new sample run synchronously if none exists
    new_sample = m.ScanRun(
        status="running",
        progress_percent=0,
        current_step="Generating sample report",
        is_sample_or_simulation=True,
    )
    db.add(new_sample)
    db.commit()
    db.refresh(new_sample)

    scanner = CloudScanner(db)
    completed_sample = scanner.execute_scan(scan_id=new_sample.id, is_demo=True)
    return completed_sample


@router.get("/{scan_id}", response_model=s.ScanRunOut)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """Retrieves full details of a completed scan with all findings and evidence."""
    scan = db.query(m.ScanRun).filter_by(id=scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan run not found")
    return scan


@router.get("", response_model=list[s.ScanRunOut])
@router.get("s", response_model=list[s.ScanRunOut])
def list_scans(db: Session = Depends(get_db)):
    """Lists historical scans to enable comparison over time."""
    scans = db.query(m.ScanRun).order_by(m.ScanRun.started_at.desc()).limit(25).all()
    return scans

