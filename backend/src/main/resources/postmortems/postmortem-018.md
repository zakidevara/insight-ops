# Incident: JWT Secret Rotation Broke Active Sessions
Date: 2024-12-03 | Severity: P1 | Service: auth-service

## Summary
All authenticated users were logged out simultaneously. Login
attempts failed for 8 minutes until the issue was resolved.

## Root Cause
The JWT signing secret was rotated without implementing a grace
period for the old key. All existing tokens became invalid instantly.
The new secret was also misconfigured with a wrong algorithm (RS256
vs HS256), causing new token generation to fail.

## Detection
Auth-service error logs showed JWT signature verification failures.
Login success rate dropped to 0%. Customer support was overwhelmed.

## Resolution
Restored the old JWT secret alongside the new one (dual validation).
Fixed the algorithm mismatch. Implemented a key rotation strategy
with overlapping validity windows.

## Indicators
- jwt_validation_error_rate > 50%
- login_success_rate < 10%
- active_session_count drop > 80% in 1min
