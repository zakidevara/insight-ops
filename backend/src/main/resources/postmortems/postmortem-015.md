# Incident: Cronjob Overlap Causing Duplicate Charges
Date: 2024-10-28 | Severity: P1 | Service: billing-service

## Summary
Approximately 3,200 customers were double-charged for their monthly
subscription. Total overbilling: $48,000 over a 2-hour window.

## Root Cause
The monthly billing cronjob took longer than its schedule interval
due to a 3x increase in subscriber count. Two instances ran concurrently
without distributed locking, processing the same batch of customers.

## Detection
Customer support received a surge of refund requests. Payment
processor webhook logs showed duplicate charge IDs.

## Resolution
Halted the billing cronjob. Issued automated refunds for all duplicates.
Added distributed locking via Redis SETNX with a TTL. Implemented
idempotency keys on all charge requests.

## Indicators
- billing_job_duration_seconds > billing_job_interval_seconds
- duplicate_charge_count > 0
- customer_refund_request_rate > 5x baseline
