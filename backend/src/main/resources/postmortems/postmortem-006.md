# Incident: TLS Certificate Expiry on Payment Gateway
Date: 2024-07-03 | Severity: P1 | Service: payment-service

## Summary
All payment transactions failed for 22 minutes. Customers received
SSL handshake errors at checkout across web and mobile clients.

## Root Cause
The TLS certificate for payments.example.com expired. The cert renewal
automation failed silently 30 days prior because the ACME account
email was changed and verification failed.

## Detection
Spike in SSL handshake failures from load balancer metrics. PagerDuty
alert triggered on payment_transaction_success_rate < 95%.

## Resolution
Manually renewed certificate via ACME and deployed to load balancer.
Fixed ACME account email. Added certificate expiry monitoring with
30-day, 14-day, and 7-day alerts.

## Indicators
- ssl_handshake_errors > 0 sustained for > 1min
- payment_transaction_success_rate < 95%
- certificate_expiry_days < 7
