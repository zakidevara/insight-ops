# Incident: CDN Cache Poisoning via Host Header Injection
Date: 2024-12-15 | Severity: P1 | Service: cdn-edge

## Summary
A subset of users received incorrect page content served from CDN
cache for 2 hours. Some pages displayed content from unrelated routes.

## Root Cause
The CDN was caching responses keyed on URL path only, ignoring the
Host header. An attacker sent requests with manipulated Host headers
that caused incorrect backend routing. The poisoned responses were
cached and served to legitimate users.

## Detection
User reports of seeing wrong page content. Cache hit ratio anomaly
detection flagged unusual patterns. Security team identified
suspicious Host header values in access logs.

## Resolution
Purged entire CDN cache. Added Host header to cache key. Implemented
Host header validation at the edge with an allowlist of known domains.

## Indicators
- cdn_cache_hit_ratio anomaly (unexpected patterns)
- user_reported_content_mismatch > 0
- http_request_host_header not in allowed_domains
