# Incident: Memory Leak in Order Service v1.2.0
Date: 2024-01-15 | Severity: P1 | Service: order-service

## Summary
Memory usage on order-service pods grew unbounded over 4 hours,
causing OOMKill events and order processing failures.

## Root Cause
A Hibernate session was not being closed in the OrderRepository
when processing bulk discount calculations. This held references
to 10,000+ entity objects per request cycle.

## Detection
GC logs showed repeated Full GC with heap never releasing below 85%.
Pattern: heap growth ~50MB/min under normal load.

## Resolution
Added explicit session.close() in finally block. Deployed v1.2.1.
Rolled back to v1.1.9 during incident.

## Indicators
- JVM heap > 80% for > 10 minutes
- Full GC frequency > 1/minute
- Pod restarts in Kubernetes (OOMKilled status)
