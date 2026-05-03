# Incident: Terraform State Lock Deadlock
Date: 2025-02-04 | Severity: P2 | Service: platform-infra

## Summary
Infrastructure changes were blocked for 6 hours. No Terraform plans
or applies could execute, preventing incident remediation that
required infrastructure changes.

## Root Cause
A CI pipeline running Terraform apply was killed mid-execution by a
timeout. The DynamoDB state lock was not released. Subsequent pipeline
runs queued behind the stale lock. The lock TTL was set to 24 hours.

## Detection
CI pipeline failures with "state lock" errors. Platform team unable
to make infrastructure changes. Manual review of DynamoDB lock table.

## Resolution
Manually removed the stale lock from DynamoDB using terraform force-unlock.
Reduced lock TTL to 30 minutes. Added a pre-pipeline check for stale
locks older than 1 hour with auto-cleanup.

## Indicators
- terraform_lock_wait_duration_seconds > 300
- ci_pipeline_failure_rate{job="terraform"} == 100%
- dynamodb_lock_age_seconds > 3600
