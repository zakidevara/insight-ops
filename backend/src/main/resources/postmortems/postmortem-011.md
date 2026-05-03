# Incident: Database Migration Lock Contention
Date: 2024-09-05 | Severity: P1 | Service: inventory-service

## Summary
Inventory lookups and stock updates failed for 25 minutes during
a scheduled deployment. The entire e-commerce checkout flow was blocked.

## Root Cause
A Flyway migration added a NOT NULL column with a default value to the
inventory table (80M rows). Postgres acquired an ACCESS EXCLUSIVE lock,
blocking all concurrent reads and writes for the duration of the ALTER.

## Detection
inventory-service health checks failed. Connection timeout errors in
dependent services. Postgres lock monitoring showed a long-held exclusive lock.

## Resolution
Killed the ALTER TABLE statement. Rewrote migration to use a three-step
approach: add nullable column, backfill in batches, then add NOT NULL constraint.

## Indicators
- pg_locks{mode="AccessExclusiveLock"} duration > 30s
- inventory_service_health_check == failing
- checkout_error_rate > 50%
