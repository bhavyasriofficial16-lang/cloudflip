"""
Verification engine — section 31 of the spec.

An action is never marked successful just because the AWS API call
succeeded. This module compares measured metrics before vs. after and
derives SUCCESS / PARTIAL / NO_IMPROVEMENT / UNKNOWN from the numbers.
"""
from dataclasses import dataclass


@dataclass
class VerificationOutcome:
    result: str   # SUCCESS | PARTIAL | NO_IMPROVEMENT | UNKNOWN


def verify_scale_action(
    cpu_before: float, cpu_after: float,
    latency_before: float, latency_after: float,
    error_rate_before: float, error_rate_after: float,
) -> VerificationOutcome:
    cpu_improved = cpu_after < cpu_before * 0.85
    latency_improved = latency_after < latency_before * 0.85
    errors_improved = error_rate_after <= error_rate_before

    improvements = sum([cpu_improved, latency_improved, errors_improved])

    if improvements == 3:
        result = "SUCCESS"
    elif improvements >= 1:
        result = "PARTIAL"
    elif cpu_after >= cpu_before and latency_after >= latency_before:
        result = "NO_IMPROVEMENT"
    else:
        result = "UNKNOWN"

    return VerificationOutcome(result=result)
