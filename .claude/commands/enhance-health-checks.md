# Enhance Health Checks

Expand health check system with detailed checks for all dependencies and health check UI.

## Backend
- Expand HealthController with detailed checks:
  - Database connectivity and query test
  - Redis connectivity (if available)
  - Email service (SMTP connection test)
  - External API availability (if any)
  - Disk space check
  - Memory usage check
- Return detailed status for each check
- Different endpoints: /health (basic), /health/detailed (full checks)

## Health Check Library
- Use Microsoft.Extensions.Diagnostics.HealthChecks
- Add custom health checks for each dependency
- Configure different health states: Healthy, Degraded, Unhealthy

## Monitoring Integration
- Expose health checks to monitoring system
- Kubernetes readiness/liveness probes
- Load balancer health checks

## Frontend
- Health status page (admin only)
- Show status of all dependencies
- Auto-refresh health status

Execute end-to-end autonomously.
