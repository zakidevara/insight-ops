# Incident: Feature Flag Evaluation Storm
Date: 2025-01-20 | Severity: P2 | Service: feature-flag-service

## Summary
All services experienced elevated latency for 20 minutes. Feature
flag evaluations that normally took <1ms spiked to 500ms.

## Root Cause
A flag targeting rule was updated to evaluate against a user attribute
that required a database lookup. The flag SDK made a synchronous DB
call for every evaluation. With 50,000 evaluations/second across all
services, the flag database was overwhelmed.

## Detection
Feature flag evaluation latency alerts. Database connection saturation
on the flag service database. Elevated p99 latencies across all services.

## Resolution
Reverted the targeting rule. Implemented local caching of user
attributes in the SDK with 60-second TTL. Added a circuit breaker
for attribute lookups with fallback to cached or default values.

## Indicators
- feature_flag_evaluation_duration_ms_p99 > 100ms
- flag_db_connection_pool_utilization > 95%
- service_latency_p99 increase > 3x across multiple services
