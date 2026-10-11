"""
Local metrics simulator — section 17 of the spec.

Generates realistic synthetic time series for the demo environment.
Every point written to ResourceMetric from here has is_synthetic=True,
so the UI can always tell simulated data from real CloudWatch data
(principle #5).
"""
import math
import random
from datetime import datetime, timedelta


def _clamp(v, lo, hi):
    return max(lo, min(hi, v))


def normal_traffic(n: int, base: float = 8000, noise: float = 400) -> list[float]:
    return [_clamp(base + random.gauss(0, noise), 0, None) for _ in range(n)]


def gradual_growth(n: int, base: float = 8000, growth_per_step: float = 180, noise: float = 300) -> list[float]:
    out = []
    v = base
    for _ in range(n):
        v += growth_per_step + random.gauss(0, noise)
        out.append(max(0, v))
    return out


def sudden_surge(n: int, base: float = 8000, surge_at: float = 0.6, multiplier: float = 5.0, noise: float = 400) -> list[float]:
    out = []
    surge_index = int(n * surge_at)
    for i in range(n):
        target = base * multiplier if i >= surge_index else base
        out.append(max(0, target + random.gauss(0, noise)))
    return out


def periodic(n: int, base: float = 8000, amplitude: float = 3000, period_steps: int = 24, noise: float = 250) -> list[float]:
    out = []
    for i in range(n):
        v = base + amplitude * math.sin(2 * math.pi * i / period_steps)
        out.append(max(0, v + random.gauss(0, noise)))
    return out


def database_bottleneck(n: int, base: float = 90, limit: float = 200, noise: float = 4) -> list[float]:
    out = []
    v = base
    for _ in range(n):
        v = _clamp(v + random.uniform(2, 6) + random.gauss(0, noise), 0, limit * 1.02)
        out.append(v)
    return out


def queue_buildup(n: int, base: float = 20, arrival_rate: float = 12, service_rate: float = 9, noise: float = 8) -> list[float]:
    out = []
    v = base
    for _ in range(n):
        v = max(0, v + (arrival_rate - service_rate) + random.gauss(0, noise))
        out.append(v)
    return out


SCENARIOS = {
    "normal": normal_traffic,
    "gradual_growth": gradual_growth,
    "sudden_surge": sudden_surge,
    "periodic": periodic,
    "database_bottleneck": database_bottleneck,
    "queue_buildup": queue_buildup,
}


def generate_scenario(name: str, n: int = 60, **kwargs) -> list[float]:
    fn = SCENARIOS.get(name, normal_traffic)
    return [round(v, 1) for v in fn(n, **kwargs)]


def timestamps_back(n: int, step_minutes: float) -> list[datetime]:
    now = datetime.utcnow()
    return [now - timedelta(minutes=step_minutes * (n - 1 - i)) for i in range(n)]
