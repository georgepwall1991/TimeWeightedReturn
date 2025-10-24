# Setup Monitoring

Implement comprehensive monitoring with Application Insights or alternative APM solution.

## Backend Monitoring
- Add Application Insights SDK
- Track custom events: TWR calculations, exports, imports
- Track dependencies: Database, Redis, external APIs
- Track exceptions with full stack traces
- Custom telemetry for financial calculations
- Performance counters

## Logging
- Configure Serilog with structured logging
- Log sinks: Console, File, Application Insights
- Log correlation with trace IDs
- Log sampling for high-volume endpoints

## Metrics
- Request duration
- Error rates
- Cache hit/miss ratio
- Background job success/failure
- API endpoint usage
- User activity metrics

## Alerting
- Critical error alerts
- Performance degradation alerts
- High error rate alerts
- Failed background job alerts

## Dashboards
- Create monitoring dashboards (Application Insights or Grafana)
- Key metrics visualization
- Real-time charts

Execute end-to-end autonomously.
