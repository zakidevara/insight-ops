# Incident: Rate Limiter Misconfiguration on Public API
Date: 2024-09-19 | Severity: P2 | Service: public-api

## Summary
Legitimate API consumers were rate-limited while a bot attack went
unchecked for 3 hours. 200+ partner integrations reported failures.

## Root Cause
A rate limiter config update swapped the per-IP and per-API-key limits.
API keys were limited to 10 req/min (intended for IPs) while IPs got
10,000 req/min (intended for keys). Bots without keys flooded the service.

## Detection
Partner support tickets about 429 errors. Traffic analysis showed
anomalous volume from a small set of IPs without API keys.

## Resolution
Reverted rate limiter config. Blocked offending IPs at WAF layer.
Added config validation tests to prevent limit value swaps.

## Indicators
- http_429_rate{source="api_key"} > 10% (legitimate users)
- http_requests_total{api_key=""} > 50000/min
- partner_error_report_count > 10 in 1 hour
