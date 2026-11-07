# CloudFlip Changelog

All notable changes to CloudFlip (`cloudflip.me`) will be documented in this file.

---

## [Phase 1: Read-Only Savings & Reliability Risk Scan] - 2026-11-07

### Added
- **Transparent Pricing Engine (`backend/app/cloud/pricing.py`)**:
  - Implemented explicit AWS On-Demand cost models for EC2, EBS, Elastic IPs, Snapshots, and Load Balancers.
  - Every calculation outputs an explicit arithmetic formula string (e.g. `"$0.3840/hr x 730 hrs/mo = $280.32/mo"`) and references `"AWS Public On-Demand Pricing (us-east-1, Oct 2026 baseline)"`.
  - Zero invented numbers rule strictly enforced.
- **8-Category Read-Only Scanner Engine (`backend/app/cloud/scanner.py`)**:
  - 100% read-only AWS inspection covering:
    1. `idle_compute`: Instances with average CPU < 5% and low network over 14 days.
    2. `oversized_instance`: Instances with peak CPU < 20% over 14 days.
    3. `unattached_ebs`: Volumes detached in `available` state for >= 7 days.
    4. `unused_eip`: Unassociated static Elastic IPs incurring $0.005/hr penalty.
    5. `old_snapshot`: Unreferenced manual snapshots older than 90 days.
    6. `idle_lb`: ALBs with zero active targets or negligible traffic over 14 days.
    7. `asg_misconfig`: ASGs with MinSize == MaxSize, single-AZ hazards, or cooldown conflicts.
    8. `saturation_risk`: Database connections and queue depth trending toward exhaustion (>85%).
  - Built-in realistic sample generator for instant pre-connect evaluation.
- **Database Persistence (`backend/app/models/models.py`)**:
  - Added `ScanRun` and `ScanFinding` models to store historical scans, progress percentages, risk summaries, and categorized findings with evidence JSON.
- **Scan API Endpoints (`backend/app/api/scan.py`)**:
  - `POST /api/scan/start`: Dispatches background scan with step-by-step progress tracking.
  - `GET /api/scan/{scan_id}/status`: Real-time polling endpoint (0% to 100%).
  - `GET /api/scan/{scan_id}`: Full scan result with categorized findings and evidence.
  - `GET /api/scans`: Historical scans list for tracking waste reduction over time.
  - `GET /api/scan/sample`: Instant sample report (no auth or AWS credentials required).
- **CloudFormation Policy Update (`infrastructure/cloudformation/cloudflip-onboarding.yaml`)**:
  - Added read-only discovery permissions: `ec2:DescribeVolumes`, `ec2:DescribeVolumeStatus`, `ec2:DescribeAddresses`, `ec2:DescribeSnapshots`, `elasticloadbalancing:DescribeLoadBalancers`, `elasticloadbalancing:DescribeTargetGroups`.
- **Frontend Dashboard Upgrade (`frontend/src/pages/Cost.tsx` & `frontend/src/api/client.ts`)**:
  - Interactive "Run 10-Minute Read-Only Scan" trigger with live animated progress bar.
  - KPI summary cards: Monthly Waste ($), Identified Risks count, Resources Audited, Audit Integrity badge.
  - Historical scans selector dropdown.
  - Category and Risk level filter tabs.
  - Transparent formula cards, 14-day metric evidence, and copyable AWS CLI / Terraform remediation code.
- **Automated Tests (`tests/test_scan_engine.py`)**:
  - Unit tests for formula accuracy, 8-category scanner execution, read-only safety, and API endpoints (19 tests total passing).
