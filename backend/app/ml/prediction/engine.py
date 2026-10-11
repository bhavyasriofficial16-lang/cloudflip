"""
Traffic / metric prediction engine — sections 19–20 of the spec.

Baseline models only for the MVP (previous value, moving average,
exponential smoothing). Random Forest / XGBoost / proper time-series
models are the documented next step (see docs/ARCHITECTURE.md) —
swap in ml/prediction/advanced.py behind the same forecast() signature
once there's enough real historical data to justify them.

Every forecast reports an uncertainty range and, when enough history
exists to backtest, MAE / RMSE / MAPE — never a bare "95% accurate"
style claim (principle #6 in the spec).
"""
from dataclasses import dataclass
import math

try:
    import numpy as np
except ImportError:
    np = None


@dataclass
class Forecast:
    horizon_minutes: int
    predicted_value: float
    lower_bound: float
    upper_bound: float
    model_name: str
    mae: float | None = None
    rmse: float | None = None
    mape: float | None = None


def _exponential_smoothing(series: list[float], alpha: float = 0.35) -> float:
    level = series[0]
    for x in series[1:]:
        level = alpha * x + (1 - alpha) * level
    return float(level)


def _trend_rate(series: list[float], step_minutes: float) -> float:
    """Simple linear growth rate (units per minute) over the recent window."""
    if len(series) < 2:
        return 0.0
    n = len(series)
    x = [i * step_minutes for i in range(n)]
    sum_x = sum(x)
    sum_y = sum(series)
    sum_xx = sum(xi * xi for xi in x)
    sum_xy = sum(xi * yi for xi, yi in zip(x, series))
    denom = n * sum_xx - sum_x * sum_x
    if denom == 0:
        return 0.0
    return float((n * sum_xy - sum_x * sum_y) / denom)


def backtest_errors(series: list[float], step_minutes: float) -> tuple[float, float, float]:
    """One-step-ahead backtest of exponential smoothing over the given series."""
    if len(series) < 8:
        return (0.0, 0.0, 0.0)
    errors, pct_errors = [], []
    for i in range(5, len(series) - 1):
        pred = _exponential_smoothing(series[:i])
        actual = series[i]
        errors.append(actual - pred)
        if actual != 0:
            pct_errors.append(abs((actual - pred) / actual))
    if not errors:
        return (0.0, 0.0, 0.0)
    mae = float(sum(abs(e) for e in errors) / len(errors))
    rmse = float(math.sqrt(sum(e * e for e in errors) / len(errors)))
    mape = float((sum(pct_errors) / len(pct_errors)) * 100) if pct_errors else 0.0
    return (round(mae, 1), round(rmse, 1), round(mape, 1))


def forecast(
    series: list[float],
    step_minutes: float,
    horizon_minutes: int,
    metric_name: str = "traffic",
) -> Forecast:
    """
    series: ordered oldest -> newest, sampled every `step_minutes`.
    Produces a point forecast for `horizon_minutes` ahead plus an
    uncertainty band derived from residual volatility.
    """
    if len(series) == 0:
        return Forecast(horizon_minutes, 0, 0, 0, "exponential_smoothing")

    level = _exponential_smoothing(series)
    recent = series[-min(len(series), 12):]
    rate_per_min = _trend_rate(recent, step_minutes)
    predicted = max(0.0, level + rate_per_min * horizon_minutes)

    # Uncertainty widens with horizon — proportional to residual std * sqrt(horizon)
    mean_val = sum(recent) / len(recent)
    variance = sum((x - mean_val) ** 2 for x in recent) / len(recent)
    residual_std = math.sqrt(variance) or predicted * 0.05
    spread = residual_std * math.sqrt(max(horizon_minutes / max(step_minutes, 1), 1)) * 0.6
    lower = max(0.0, predicted - spread)
    upper = predicted + spread

    mae, rmse, mape = backtest_errors(series, step_minutes)

    return Forecast(
        horizon_minutes=horizon_minutes,
        predicted_value=round(predicted, 1),
        lower_bound=round(lower, 1),
        upper_bound=round(upper, 1),
        model_name="exponential_smoothing",
        mae=mae or None,
        rmse=rmse or None,
        mape=mape or None,
    )

