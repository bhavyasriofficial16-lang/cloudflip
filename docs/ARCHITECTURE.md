# CloudFlip.ai — Architecture Notes

## What's implemented (MVP)

**Backend (FastAPI + SQLAlchemy + PostgreSQL)**
- Full data model for all 15 entities in the spec (User, CloudAccount,
  Resource, ResourceMetric, Dependency, Anomaly, Prediction, Bottleneck,
  Simulation, Recommendation, Action, ActionVerification, CostEstimate,
  ActivityLog, SurgeEvent).
- Local metrics simulator (`app/services/local_metrics_simulator.py`)
  generating the 6 scenarios from the spec: normal, gradual growth,
  sudden surge, periodic, database bottleneck, queue buildup.
- Anomaly detection: rolling z-score and EWMA (`app/ml/anomaly`).
- Prediction engine: exponential smoothing + linear trend, with an
  uncertainty band and backtested MAE/RMSE/MAPE (`app/ml/prediction`).
- Capacity + bottleneck engine: required-instance math from a measured
  per-instance capacity, ETA-to-limit projection (`app/ml/capacity`).
- What-if simulator: pure function, no AWS client reference at all —
  structurally incapable of touching real infrastructure
  (`app/ml/simulation`).
- Recommendation engine: converts predictions/bottlenecks into
  evidence-backed proposals (`app/ml/recommendations`).
- Action + verification engine: approve → execute (simulated unless
  `USE_REAL_AWS=true` and `SIMULATION_ONLY_MODE=false`) → measure
  before/after metrics → SUCCESS/PARTIAL/NO_IMPROVEMENT
  (`app/actions`, `app/verification`).
- REST API matching the spec's endpoint list (`app/api/*.py`).
- Boto3 wrapper (`app/cloud/aws_client.py`) that only ever runs on the
  backend, defaults to demo mode, and is structured so each new AWS
  service is one `discover_*` method away.

**Frontend (React + TypeScript + Vite + Tailwind)**
- Landing page with the problem → verified-solution flip-card animation.
- Full sidebar IA matching the spec (Overview, Resources, Dependency
  map, Predictions, Anomalies, Bottlenecks, Simulator, Recommendations,
  Actions, Cost, Activity).
- Simulator, Recommendations (approve/reject), and Actions pages are
  wired live to the backend API — not mocked.

**Tests**
- `tests/test_prediction.py`, `test_anomaly.py`, `test_capacity.py`,
  `test_simulator.py` — 13 passing tests covering the scenarios named
  in the spec's testing section.

## What's intentionally stubbed / next steps

- **Auth**: no Supabase wiring yet. `.env.example` has the placeholders;
  add `supabase-js` on the frontend and JWT verification via
  `python-jose` (already in requirements.txt) on the backend.
- **Full AWS discovery**: only `discover_ec2()` is implemented end to
  end as a template. Add `discover_ecs`, `discover_rds`, `discover_s3`,
  `discover_elb`, `discover_sqs`, `discover_asg`, `discover_lambda`
  following the same shape in `app/cloud/aws_client.py`.
- **CloudWatch collector**: scaffolded in
  `app/collectors/cloudwatch_collector.py` but not scheduled — wire it
  to a periodic task (Celery beat, APScheduler, or a cron container)
  once a real AWS account is connected.
- **Advanced prediction models**: Random Forest / XGBoost are a
  documented next step — swap them in behind the same `forecast()`
  signature in `app/ml/prediction/engine.py` once there's enough real
  historical data to justify them over the baseline.
- **Isolation Forest** anomaly detection: same idea — add alongside
  z-score/EWMA once there's a labeled dataset to validate against.
- **Alembic migrations**: `Base.metadata.create_all()` is used for the
  MVP; the `alembic` dependency is already in requirements.txt —
  initialize it (`alembic init`) once the schema stabilizes.
- **AI explanation layer / "Ask CloudFlip" assistant** (sections 32–33):
  not implemented. Add an endpoint that assembles the structured data
  already available from the other endpoints and passes it to an LLM
  with an explicit "explain only, never invent resources/metrics"
  system prompt.
- **CI** (GitHub Actions): not included — add a workflow that runs
  `pytest` and `npm run build` on push.

## Key design decisions

- The what-if **simulator has zero AWS imports** — verified by a test
  that reads its own source and asserts `boto3`/`aws_client` never
  appear in it, so "simulation only" is enforced structurally, not
  just by convention.
- **Simulation-only mode** is a hard backend switch
  (`SIMULATION_ONLY_MODE=true` by default) — even an approved
  recommendation won't call AWS while it's on, independent of the
  frontend.
- Every cost/capacity number states its assumption (`app/api/cost.py`,
  `app/ml/simulation/simulator.py`) rather than presenting a bare
  figure, per the spec's "no fabricated metrics" principle.
