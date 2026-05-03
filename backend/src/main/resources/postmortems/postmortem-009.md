# Incident: Cascading Timeout in Microservice Mesh
Date: 2024-08-14 | Severity: P1 | Service: product-catalog

## Summary
Product pages returned errors or loaded extremely slowly for 18 minutes.
The product-catalog service caused cascading failures across 5 downstream services.

## Root Cause
A new recommendation engine endpoint had a 30-second default timeout.
When the recommendation DB became slow, threads in product-catalog were
exhausted waiting, which propagated back pressure to all callers.

## Detection
Thread pool exhaustion alerts on product-catalog. p99 latency exceeded
15 seconds. Error rate climbed to 40% across dependent services.

## Resolution
Added 2-second timeout to recommendation engine calls. Implemented
bulkhead pattern to isolate recommendation failures. Made recommendations
non-blocking with a fallback to cached results.

## Indicators
- http_server_active_threads == max_threads for > 2min
- http_request_duration_seconds_p99 > 10s
- downstream_error_rate > 20% across multiple services
