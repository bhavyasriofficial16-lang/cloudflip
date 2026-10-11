import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.ml.anomaly.detector import zscore_anomaly, ewma_anomaly


def test_normal_behavior_is_not_flagged():
    series = [55, 56, 54, 57, 55, 56, 58, 55]
    result = zscore_anomaly(series)
    assert result.is_anomaly is False


def test_abnormal_cpu_is_flagged():
    series = [50, 52, 51, 53, 50, 52, 95]
    result = zscore_anomaly(series)
    assert result.is_anomaly is True
    assert result.severity in ("medium", "high", "critical")


def test_abnormal_traffic_flagged_by_ewma():
    series = [8000, 8100, 7900, 8050, 8000, 8100, 8050, 30000]
    result = ewma_anomaly(series)
    assert result.is_anomaly is True
