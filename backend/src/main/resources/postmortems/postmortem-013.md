# Incident: Kubernetes Node Autoscaler Stuck
Date: 2024-10-02 | Severity: P1 | Service: platform-infra

## Summary
New pod deployments were stuck in Pending state for 40 minutes during
a traffic surge. Auto-scaling could not provision new nodes.

## Root Cause
The cluster autoscaler hit an AWS EC2 instance limit (vCPU quota) in
the us-east-1 region. The autoscaler retried indefinitely without
surfacing the quota error clearly.

## Detection
Pod pending duration exceeded 5 minutes. HPA target replicas showed
desired > available. Cluster autoscaler logs showed ScaleUp errors.

## Resolution
Requested vCPU quota increase from AWS. Added multi-region node pools
as overflow capacity. Configured autoscaler alerts for quota-related errors.

## Indicators
- kube_pod_status_phase{phase="Pending"} count > 10 for > 5min
- cluster_autoscaler_errors{type="ScaleUp"} > 0
- hpa_desired_replicas > hpa_current_replicas for > 10min
