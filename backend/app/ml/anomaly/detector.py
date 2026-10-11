"""
Anomaly detection — section 18 of the spec.

Starts with rolling average / rolling standard deviation / z-score /
EWMA, as specified. Isolation Forest is stubbed for a later iteration
(kept out of the MVP so the model stays explainable and fast).
"""
import math
from dataclasses import dataclass

try:
    import numpy as np
except ImportError:
    np = None


@dataclass
class AnomalyResult:
    is_anomaly: bool
    current_value: float
    baseline_value: float
    deviation_sigma: float
    severity: str   # low | medium | high | critical
    method: str


def _severity_from_sigma(sigma: float) -> str:
    s = abs(sigma)
    if s >= 3.0:
        return "critical"
    if s >= 2.0:
        return "high"
    if s >= 1.5:
        return "medium"
    return "low"


def zscore_anomaly(series: list[float], threshold: float = 2.0) -> AnomalyResult:
    """
    Compares the most recent point against the rolling mean/std of the
    preceding window. `series` must be ordered oldest -> newest.
    """
    if len(series) < 5:
        current = series[-1] if series else 0.0
        return AnomalyResult(False, current, current, 0.0, "low", "zscore")

    history = series[:-1]
    current = float(series[-1])

    if np is not None:
        arr = np.array(history, dtype=float)
        mean = float(arr.mean())
        std = float(arr.std()) or 1e-6
    else:
        mean = sum(history) / len(history)
        variance = sum((x - mean) ** 2 for x in history) / len(history)
        std = math.sqrt(variance) or 1e-6

    sigma = (current - mean) / std
    is_anomaly = abs(sigma) >= threshold
    return AnomalyResult(
        is_anomaly=is_anomaly,
        current_value=current,
        baseline_value=round(mean, 2),
        deviation_sigma=round(sigma, 2),
        severity=_severity_from_sigma(sigma) if is_anomaly else "low",
        method="zscore",
    )



def ewma_anomaly(series: list[float], alpha: float = 0.3, threshold: float = 2.0) -> AnomalyResult:
    """Exponentially weighted moving average / deviation baseline."""
    if len(series) < 5:
        current = series[-1] if series else 0.0
        return AnomalyResult(False, current, current, 0.0, "low", "ewma")

    history = series[:-1]
    current = float(series[-1])

    ewma = history[0]
    ewvar = 0.0
    for x in history[1:]:
        diff = x - ewma
        incr = alpha * diff
        ewma += incr
        ewvar = (1 - alpha) * (ewvar + alpha * diff * diff)

    std = (ewvar ** 0.5) or 1e-6
    sigma = (current - ewma) / std
    is_anomaly = abs(sigma) >= threshold
    return AnomalyResult(
        is_anomaly=is_anomaly,
        current_value=current,
        baseline_value=round(ewma, 2),
        deviation_sigma=round(sigma, 2),
        severity=_severity_from_sigma(sigma) if is_anomaly else "low",
        method="ewma",
    )


def detect(series: list[float], method: str = "zscore") -> AnomalyResult:
    if method == "ewma":
        return ewma_anomaly(series)
    return zscore_anomaly(series)
