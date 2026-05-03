# Incident: Goroutine Leak in WebSocket Handler
Date: 2025-02-18 | Severity: P2 | Service: realtime-service

## Summary
The realtime-service (Go) gradually consumed all available memory over
48 hours, resulting in OOMKill. WebSocket connections dropped for all
connected users during restart.

## Root Cause
A goroutine was spawned for each WebSocket connection to handle
heartbeats. When clients disconnected ungracefully (no close frame),
the heartbeat goroutine was never terminated. Goroutine count grew
from 5,000 to 800,000 over two days.

## Detection
Memory usage trending alert on realtime-service pods. Goroutine count
metric exceeded 100,000. Eventually OOMKill triggered pod restarts.

## Resolution
Added context cancellation tied to connection lifecycle. Implemented
a connection reaper that cleans up stale connections after 5 minutes
of inactivity. Added goroutine count alerting at 20,000 threshold.

## Indicators
- go_goroutines > 20000
- container_memory_usage_bytes trending upward without plateau
- websocket_connection_count != go_goroutines (divergence)
