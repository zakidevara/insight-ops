# Incident: Redis Cluster Split-Brain During Network Partition
Date: 2024-07-18 | Severity: P1 | Service: session-service

## Summary
Users experienced random logouts and session data inconsistencies for
35 minutes. Approximately 15% of active sessions were lost.

## Root Cause
A network partition between two availability zones caused the Redis
cluster to elect a new master in each partition. When the partition
healed, conflicting writes resulted in data loss during reconciliation.

## Detection
Sudden increase in 401 errors from session-service. Redis Sentinel
logs showed multiple failover events within a 2-minute window.

## Resolution
Forced cluster re-election to a single master. Restored lost sessions
from the backup replica. Reconfigured Redis Sentinel with
min-replicas-to-write=1 to prevent split-brain writes.

## Indicators
- redis_sentinel_failover_count > 1 in 5min
- http_401_rate{service="session-service"} > 5%
- redis_connected_replicas < expected_count
