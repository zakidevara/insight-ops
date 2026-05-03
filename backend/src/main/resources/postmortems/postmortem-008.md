# Incident: Disk Space Exhaustion on Logging Pipeline
Date: 2024-08-01 | Severity: P2 | Service: logging-pipeline

## Summary
Application logs stopped being indexed in Elasticsearch for 2 hours.
Engineers lost observability into production services during the outage.

## Root Cause
A debug logging flag was accidentally enabled in the cart-service
deployment, producing 50x the normal log volume. Fluentd buffer disk
on log aggregator nodes filled to 100%, causing log drops.

## Detection
Elasticsearch indexing rate dropped to zero. Fluentd emitted
buffer_overflow error logs. Disk usage alerts fired on aggregator nodes.

## Resolution
Disabled debug logging in cart-service. Cleared Fluentd buffers.
Added log rate limiting per service (1000 lines/sec cap) in Fluentd config.

## Indicators
- fluentd_buffer_disk_usage_percent > 90%
- elasticsearch_indexing_rate == 0
- log_volume_bytes_per_minute{service="cart-service"} > 10x baseline
