# Incident: Kafka Consumer Lag Spike in Notification Service
Date: 2024-06-25 | Severity: P2 | Service: notification-service

## Summary
Push notifications and emails were delayed by up to 45 minutes.
Consumer lag on the notifications topic grew to 2 million messages.

## Root Cause
A deployment introduced synchronous HTTP calls to a third-party email
provider inside the Kafka consumer loop. The provider had elevated
latency (3s per call), reducing throughput from 5000 msg/s to 50 msg/s.

## Detection
Kafka consumer lag metric exceeded threshold of 100,000. End-user
reports of delayed notifications began arriving 15 minutes into the incident.

## Resolution
Rolled back the deployment. Refactored to use async HTTP client with
batching (50 emails per request). Added circuit breaker for provider calls.

## Indicators
- kafka_consumer_lag{topic="notifications"} > 100000
- notification_delivery_latency_p99 > 10min
- email_provider_response_time_seconds > 2s
