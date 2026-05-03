# Incident: GraphQL N+1 Query Performance Degradation
Date: 2024-10-15 | Severity: P2 | Service: storefront-bff

## Summary
Storefront page load times increased from 200ms to 8 seconds.
Conversion rate dropped 30% over a 4-hour window before detection.

## Root Cause
A new GraphQL resolver for product reviews used an N+1 query pattern.
Each product on a listing page triggered a separate database query
for reviews, resulting in 200+ queries per page load.

## Detection
APM traces showed 200+ SQL queries per GraphQL request. Database
CPU utilization climbed to 85%. Frontend performance monitoring
flagged p95 page load > 5s.

## Resolution
Implemented DataLoader batching for the reviews resolver. Added
query complexity analysis to reject expensive queries at the gateway.

## Indicators
- graphql_query_duration_seconds_p95 > 3s
- db_queries_per_request > 50
- db_cpu_utilization_percent > 80%
