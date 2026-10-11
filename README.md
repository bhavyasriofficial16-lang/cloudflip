# CloudFlip.ai

AI-powered predictive cloud infrastructure platform.
**Flip from reactive to predictive.**

This is a working MVP: a real FastAPI backend with an anomaly
detector, prediction engine, capacity/bottleneck engine, what-if
simulator, recommendation engine, and action/verification engine —
plus a React + TypeScript dashboard wired to it live. It runs entirely
in **demo mode** out of the box (synthetic data, no AWS account
needed) and is structured so a real AWS connection is a config change,
not a rewrite.

See `docs/ARCHITECTURE.md` for exactly what's implemented vs. stubbed.

---

## Quick start (Docker — recommended)

Requires Docker Desktop (or Docker Engine + Compose) installed.

```bash
cd cloudflip
cp .env.example .env
docker compose up --build
```

Then open:
- **Frontend:** http://localhost:5173
- **Backend API docs (Swagger):** http://localhost:8000/docs

The backend creates its tables and seeds a demo account/resources
automatically on first startup — there's nothing else to run.

To stop: `docker compose down` (add `-v` to also wipe the Postgres volume).

---

## Running without Docker

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Easiest: point at a local SQLite file instead of Postgres
export DATABASE_URL="sqlite:///./cloudflip.db"        # Windows (PowerShell): $env:DATABASE_URL="sqlite:///./cloudflip.db"

uvicorn app.main:app --reload --port 8000
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

---

## Running the tests

```bash
cd cloudflip
pip install -r backend/requirements.txt
pytest tests/ -v
```

13 tests covering the prediction engine, anomaly detector, capacity
engine, and simulator — including a test that asserts the simulator
module never imports `boto3` or the AWS client, so "simulation only"
is structurally guaranteed, not just a UI label.

---

## Connecting a real AWS account (optional)

By default `USE_REAL_AWS=false` and `SIMULATION_ONLY_MODE=true` in
`.env` — everything runs on synthetic data and no AWS call is ever
made, even if you approve a recommendation.

To connect a real account:

1. Create a least-privilege IAM role — a starting Terraform template
   is in `infrastructure/terraform/main.tf`. Never use root credentials.
2. Set in `.env`:
   ```
   USE_REAL_AWS=true
   AWS_REGION=your-region
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```
   (or `AWS_ROLE_ARN` if assuming a role)
3. Leave `SIMULATION_ONLY_MODE=true` until you're ready for CloudFlip
   to actually execute approved actions — flip it to `false` only when
   you're confident in the recommendation quality.
4. Call `POST /api/aws/discover` to run resource discovery. This
   endpoint requires a signed-in user on a **paid plan** (see Billing
   below) — connecting real infrastructure is gated, matching the
   pricing model.

Only `discover_ec2()` is fully implemented as a template in
`backend/app/cloud/aws_client.py` — add the other 7 services
(ECS, RDS, S3, ELB, SQS, ASG, Lambda) following the same pattern.

---

## Auth (Supabase)

The app works with no auth configured — you get the full demo
playground with no sign-in. To turn on real accounts:

1. Create a free project at [supabase.com](https://supabase.com).
2. From Project Settings → API, copy the **Project URL**, **anon
   public key**, and **JWT Secret**.
3. Backend `.env`: set `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
   `SUPABASE_JWT_SECRET`.
4. Frontend: create `frontend/.env` with:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   VITE_API_URL=http://localhost:8000
   ```
5. Restart both services. `/login` and `/signup` will now create real
   Supabase accounts; the backend verifies each request's JWT in
   `app/auth/dependencies.py` and auto-provisions a local `User` row
   the first time it sees a new Supabase user.

No passwords ever touch the backend — Supabase owns credential storage
entirely.

---

## Billing (Stripe) — turning this into a paid product

Plans are defined once, in `backend/app/billing/plans.py` — the
pricing page (`/pricing`) reads them from `GET /api/billing/plans`, so
UI and backend gating can never drift apart.

| Plan | What it gates |
|---|---|
| Free / Demo | Playground only — no real AWS connection, resource-limited |
| Pro Monthly / Pro Annual | Real AWS connection, unlimited resources, automated actions |
| Pay-as-you-go | Same as Pro, billed per monitored resource-hour via Stripe metered billing |

**Setup:**

1. Create a [Stripe](https://stripe.com) account (test mode is fine to start).
2. Create three Prices in the Stripe dashboard: one recurring monthly,
   one recurring annual, one **metered** recurring price (for
   pay-as-you-go). Copy their Price IDs.
3. Backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...      # from `stripe listen` during local dev
   STRIPE_PRICE_MONTHLY=price_...
   STRIPE_PRICE_ANNUAL=price_...
   STRIPE_PRICE_METERED=price_...
   ```
4. Forward webhooks locally with the Stripe CLI:
   ```
   stripe listen --forward-to localhost:8000/api/billing/webhook
   ```
5. A user clicks a plan on `/pricing` → `POST /api/billing/checkout-session`
   creates a Stripe Checkout session → Stripe redirects back on success
   → Stripe's webhook (not the frontend) tells the backend the
   subscription is active, which is what actually unlocks the paid
   features. This means a user can't fake an upgrade by tampering with
   the frontend.
6. For pay-as-you-go, call `app/billing/metering.record_resource_hour()`
   from a scheduled job once per monitored resource per hour, and
   `report_pending_usage()` on a schedule (e.g. daily) to push totals
   to Stripe.

**Gating in code:** `app/auth/dependencies.require_active_plan` is a
FastAPI dependency — attach it to any endpoint that should require a
paid plan (already applied to `POST /api/aws/discover`). Add it to
other endpoints as you decide what's free vs. paid.

---



## Project structure

```
cloudflip/
├── docker-compose.yml
├── .env.example
├── backend/            FastAPI app — see docs/ARCHITECTURE.md
│   └── app/
│       ├── api/            REST endpoints
│       ├── models/         SQLAlchemy models
│       ├── schemas/        Pydantic request/response schemas
│       ├── ml/              anomaly / prediction / capacity / simulation / recommendations
│       ├── actions/        action engine
│       ├── verification/   verification engine
│       ├── auth/            Supabase JWT verification + plan-gating dependency
│       ├── billing/         plan catalog, Stripe client, checkout/webhook/metering
│       ├── cloud/          boto3 wrapper (demo-safe by default)
│       ├── collectors/     CloudWatch collector (for live mode)
│       └── services/       local metrics simulator, demo seed data
├── frontend/           React + TypeScript + Vite + Tailwind dashboard
├── infrastructure/terraform/   starting IAM role template
├── tests/              pytest suite
└── docs/ARCHITECTURE.md
```

## Safety principles this build enforces

- No fabricated AWS resources or metrics — demo data is always
  labeled `is_synthetic: true` and the UI shows a persistent demo banner.
- The what-if simulator cannot touch real infrastructure — verified
  by a test, not just a comment.
- Infrastructure-changing actions require explicit approval
  (`POST /api/recommendations/{id}/approve`) before anything executes.
- `SIMULATION_ONLY_MODE` is a backend-enforced kill switch, independent
  of whatever the frontend shows.
- Every cost/capacity estimate states its assumption rather than
  presenting a bare number.
