# Incident: Container Image Pull Failure After Registry Migration
Date: 2024-11-08 | Severity: P1 | Service: platform-infra

## Summary
All new deployments and pod restarts failed for 30 minutes.
Running pods were unaffected but no rollbacks or scale-ups were possible.

## Root Cause
The container registry was migrated from Docker Hub to a private ECR.
Image pull secrets were updated in the default namespace but not in
the 4 other application namespaces, causing ImagePullBackOff errors.

## Detection
Deployment rollout status showed 0 available replicas. Kubernetes
events showed ImagePullBackOff across multiple namespaces.

## Resolution
Applied image pull secrets to all namespaces via a script. Added a
namespace admission webhook to enforce pull secret presence on creation.

## Indicators
- kube_pod_container_status_waiting_reason{reason="ImagePullBackOff"} > 0
- deployment_available_replicas == 0 for any deployment
- container_registry_pull_errors > 0
