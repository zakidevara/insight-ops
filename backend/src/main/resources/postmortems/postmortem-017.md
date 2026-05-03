# Incident: Elasticsearch Index Corruption After Forced Restart
Date: 2024-11-20 | Severity: P2 | Service: search-service

## Summary
Product search returned incomplete results for 3 hours. Approximately
30% of the product catalog was missing from search results.

## Root Cause
An Elasticsearch node was force-killed during an index merge operation.
Two primary shards became corrupted and could not be recovered from
the remaining replicas, which had the same corruption.

## Detection
Search result count anomaly alert fired (results < 70% of expected).
Elasticsearch cluster health turned red with unassigned shards.

## Resolution
Restored corrupted shards from the nightly snapshot. Triggered a
full reindex from the product database. Increased replica count from
1 to 2 and enabled shard allocation awareness across zones.

## Indicators
- elasticsearch_cluster_health_status == red
- elasticsearch_unassigned_shards > 0
- search_result_count < 70% of catalog_product_count
