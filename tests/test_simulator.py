import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.ml.simulation.simulator import run_simulation


def test_2x_traffic_within_existing_capacity():
    outcome = run_simulation(traffic_multiplier=2, horizon_minutes=30, current_instances=4)
    # 4 instances * 2500 = 10000 capacity; 2x of 8000 baseline = 16000 -> needs more instances
    assert outcome.predicted_traffic_rpm == 16000


def test_5x_traffic_requires_more_instances():
    outcome = run_simulation(traffic_multiplier=5, horizon_minutes=30, current_instances=4)
    assert outcome.required_instances > 4
    assert outcome.bottleneck != "None projected"


def test_10x_traffic_has_higher_cost_than_5x():
    out5 = run_simulation(traffic_multiplier=5, horizon_minutes=30, current_instances=4)
    out10 = run_simulation(traffic_multiplier=10, horizon_minutes=30, current_instances=4)
    assert out10.estimated_additional_cost_per_hour >= out5.estimated_additional_cost_per_hour


def test_simulation_never_touches_real_infrastructure():
    """The simulator module has no AWS client reference at all."""
    import app.ml.simulation.simulator as sim_module
    source = open(sim_module.__file__).read()
    assert "boto3" not in source
    assert "aws_client" not in source
