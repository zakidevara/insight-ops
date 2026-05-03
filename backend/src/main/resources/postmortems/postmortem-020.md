# Incident: gRPC Deadline Propagation Bug
Date: 2025-01-07 | Severity: P2 | Service: order-service

## Summary
Order placement intermittently failed with DEADLINE_EXCEEDED errors
during peak hours for 2 days before root cause was identified.

## Root Cause
The order-service propagated incoming gRPC deadlines to downstream
calls without adding buffer time. A 5-second client deadline was
split across 4 sequential downstream calls, leaving less than 1 second
for each hop. Under load, any single call exceeding its share caused failure.

## Detection
Intermittent DEADLINE_EXCEEDED errors in order-service traces. Error
rate correlated with traffic volume. Distributed tracing showed
cascading deadline violations.

## Resolution
Implemented independent deadlines per downstream call (2s each) instead
of propagating the parent deadline. Added deadline budget tracking
middleware to log remaining budget at each hop.

## Indicators
- grpc_status{code="DEADLINE_EXCEEDED"} rate > 1%
- order_placement_error_rate > 5% during peak
- grpc_deadline_remaining_seconds < 1 at any hop
