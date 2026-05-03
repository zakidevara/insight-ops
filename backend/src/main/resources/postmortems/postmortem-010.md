# Incident: S3 Bucket Policy Misconfiguration
Date: 2024-08-28 | Severity: P2 | Service: media-service

## Summary
User-uploaded images and documents were inaccessible for 1 hour.
All media URLs returned 403 Forbidden errors.

## Root Cause
An infrastructure-as-code change tightened the S3 bucket policy to
require a VPC endpoint that had not yet been provisioned. Public and
CDN access was inadvertently blocked.

## Detection
CDN cache miss rate jumped to 100%. Origin fetch errors from CloudFront
triggered an alert. User reports of broken images on the platform.

## Resolution
Reverted the bucket policy change. Created a proper migration plan
for the VPC endpoint transition with a phased rollout.

## Indicators
- s3_request_errors{error="AccessDenied"} > 0 sustained
- cdn_origin_error_rate > 10%
- media_load_failure_rate > 5% from frontend telemetry
