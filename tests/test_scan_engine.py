"""
Automated Unit Tests for CloudFlip Read-Only Savings & Risk Scan Engine.
"""
import pytest
from app.database.session import Base, engine, SessionLocal
from app.models import models as m
from app.cloud.pricing import (
    calculate_ec2_idle_saving,
    calculate_ec2_downsize_saving,
    calculate_ebs_unattached_saving,
    calculate_unused_eip_saving,
    calculate_old_snapshot_saving,
    calculate_idle_lb_saving,
    calculate_rds_downsize_saving,
    DEFAULT_PRICING_SOURCE,
)
from app.cloud.scanner import CloudScanner


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_transparent_pricing_formulas():
    # 1. EC2 Idle
    calc_idle = calculate_ec2_idle_saving("m5.2xlarge")
    assert calc_idle["monthly_saving"] > 0
    assert "$0.3840/hr x 730" in calc_idle["pricing_formula"]
    assert calc_idle["pricing_source"] == DEFAULT_PRICING_SOURCE

    # 2. EC2 Downsize
    calc_downsize = calculate_ec2_downsize_saving("m5.2xlarge", "t4g.large")
    assert calc_downsize["monthly_saving"] > 0
    assert "t4g.large" in calc_downsize["pricing_formula"]

    # 3. Unattached EBS
    calc_ebs = calculate_ebs_unattached_saving(size_gb=500, volume_type="gp2")
    assert calc_ebs["monthly_saving"] == 50.0  # 500 * $0.10
    assert "500 GB x $0.10/GB-mo" in calc_ebs["pricing_formula"]

    # 4. Unused Elastic IP
    calc_eip = calculate_unused_eip_saving(count=4)
    assert calc_eip["monthly_saving"] == 14.60  # 4 * 0.005 * 730
    assert "4 unused EIP(s)" in calc_eip["pricing_formula"]

    # 5. Old Snapshot
    calc_snap = calculate_old_snapshot_saving(size_gb=400)
    assert calc_snap["monthly_saving"] == 20.0  # 400 * 0.05
    assert "400 GB snapshot data" in calc_snap["pricing_formula"]

    # 6. Idle Load Balancer
    calc_lb = calculate_idle_lb_saving("application")
    assert calc_lb["monthly_saving"] == 16.43  # 0.0225 * 730
    assert "$0.0225/hr base charge" in calc_lb["pricing_formula"]

    # 7. RDS Downsize
    calc_rds = calculate_rds_downsize_saving("db.r5.2xlarge", "db.r5.large")
    assert calc_rds["monthly_saving"] > 0
    assert "db.r5.large" in calc_rds["pricing_formula"]


def test_scanner_executes_and_populates_all_8_categories(setup_db):
    db = setup_db
    scanner = CloudScanner(db)

    scan_run = m.ScanRun(
        status="running",
        progress_percent=0,
        is_sample_or_simulation=True,
    )
    db.add(scan_run)
    db.commit()
    db.refresh(scan_run)

    completed_scan = scanner.execute_scan(scan_id=scan_run.id, is_demo=True)
    assert completed_scan.status == "completed"
    assert completed_scan.progress_percent == 100
    assert completed_scan.total_monthly_waste > 0
    assert completed_scan.findings_count >= 8

    # Verify categories present
    categories = {f.category for f in completed_scan.findings}
    expected_categories = {
        "idle_compute",
        "oversized_instance",
        "unattached_ebs",
        "unused_eip",
        "old_snapshot",
        "idle_lb",
        "asg_misconfig",
        "saturation_risk",
    }
    assert expected_categories.issubset(categories)

    # Verify each finding has transparent formula, pricing source, and evidence
    for f in completed_scan.findings:
        assert f.pricing_formula is not None and len(f.pricing_formula) > 0
        assert f.pricing_source is not None and len(f.pricing_source) > 0
        assert f.evidence is not None and isinstance(f.evidence, dict)
        assert f.risk_level in ["Zero", "Low", "Medium", "High", "Critical"]
        assert f.recommended_fix is not None and len(f.recommended_fix) > 0


def test_scan_api_endpoints_integration(setup_db):
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Test Sample Scan (No auth required)
    resp = client.get("/api/scan/sample")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "completed"
    assert data["is_sample_or_simulation"] is True
    assert len(data["findings"]) >= 8
    assert data["total_monthly_waste"] > 0

    scan_id = data["id"]

    # 2. Test Get Specific Scan
    resp_get = client.get(f"/api/scan/{scan_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["id"] == scan_id

    # 3. Test Get Status
    resp_status = client.get(f"/api/scan/{scan_id}/status")
    assert resp_status.status_code == 200
    status_data = resp_status.json()
    assert status_data["status"] == "completed"
    assert status_data["progress_percent"] == 100

    # 4. Test List Scans
    resp_list = client.get("/api/scans")
    assert resp_list.status_code == 200
    assert isinstance(resp_list.json(), list)
    assert len(resp_list.json()) >= 1
