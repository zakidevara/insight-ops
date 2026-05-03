# Incident: Prometheus Scrape Timeout Cascade
Date: 2024-03-02 | Severity: P2 | Service: metrics-pipeline

## Summary
Prometheus scrape timeouts on 3 high-cardinality services caused
a query backlog that degraded the entire metrics pipeline for 45 minutes.

## Root Cause
A new label `user_id` was added to a counter metric in payment-service,
creating 50,000+ unique time series. Prometheus scrape timeout
set to 10s was insufficient.

## Resolution
Removed user_id label, replaced with bucketed user_tier label.
Increased scrape timeout to 30s for payment-service only.
