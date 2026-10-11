import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.ml.prediction.engine import forecast


def test_normal_traffic_forecast_stays_close_to_level():
    series = [8000 + (i % 3) * 50 for i in range(20)]
    f = forecast(series, step_minutes=3, horizon_minutes=15)
    assert 7500 < f.predicted_value < 8500
    assert f.lower_bound <= f.predicted_value <= f.upper_bound


def test_gradual_increase_forecast_trends_upward():
    series = [8000 + i * 150 for i in range(20)]
    f = forecast(series, step_minutes=3, horizon_minutes=15)
    assert f.predicted_value > series[-1]


def test_sudden_spike_forecast_reflects_recent_level():
    series = [8000] * 15 + [40000] * 5
    f = forecast(series, step_minutes=3, horizon_minutes=10)
    assert f.predicted_value > 15000
