import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.ml.capacity.engine import required_capacity


def test_low_demand_requires_no_extra_instances():
    plan = required_capacity(predicted_demand_rpm=8000, current_instances=4, measured_rpm_per_instance=2500)
    assert plan.additional_instances == 0


def test_high_demand_requires_extra_instances():
    plan = required_capacity(predicted_demand_rpm=31800, current_instances=4, measured_rpm_per_instance=2500)
    assert plan.required_instances >= 13
    assert plan.additional_instances > 0


def test_scaling_calculation_is_proportional():
    plan = required_capacity(predicted_demand_rpm=50000, current_instances=4, measured_rpm_per_instance=2500)
    assert plan.required_instances == 20
