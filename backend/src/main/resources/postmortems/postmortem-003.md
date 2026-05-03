# Incident: Connection Pool Exhaustion in Auth Service
Date: 2024-05-20 | Severity: P1 | Service: auth-service

## Summary
All auth-service instances stopped responding to login requests for 12 minutes.
Users received 503 errors across all frontend applications.

## Root Cause
A slow query introduced in a migration (adding index on users.last_login)
held database connections for 30+ seconds. HikariCP pool (max 10)
was exhausted within 2 minutes under normal traffic.

## Detection
HikariCP metrics showed pending connection count climbing to 200+.
Active connections pinned at pool max (10) for > 5 minutes.

## Resolution
Killed the long-running migration. Increased pool size to 20 as
interim measure. Rescheduled migration for maintenance window
with `CONCURRENTLY` flag.

## Indicators
- hikaricp_pending_threads > 50
- hikaricp_active_connections == hikaricp_max_connections for > 2min
- 503 error rate > 5% on auth endpoints
