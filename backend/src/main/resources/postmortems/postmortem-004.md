# Incident: DNS Resolution Failure in API Gateway
Date: 2024-06-10 | Severity: P1 | Service: api-gateway

## Summary
API gateway returned 502 errors for all downstream services for 8 minutes.
External and internal consumers experienced complete service outage.

## Root Cause
CoreDNS pods in the Kubernetes cluster ran out of memory due to excessive
DNS cache entries from a misconfigured TTL override (set to 0). Every
request triggered a new upstream DNS lookup, overwhelming CoreDNS.

## Detection
Spike in 502 responses from api-gateway. CoreDNS pods showing OOMKilled
in kube-system namespace. DNS resolution latency exceeded 5 seconds.

## Resolution
Reverted TTL override in CoreDNS ConfigMap. Restarted CoreDNS pods.
Added memory limits and resource requests to prevent silent OOM.

## Indicators
- 502 error rate > 50% on api-gateway
- dns_lookup_duration_seconds > 2s
- CoreDNS pod restarts in kube-system namespace
