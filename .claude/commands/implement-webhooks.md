# Implement Webhooks

Add webhook system for event notifications to external systems.

## Backend
- Create Webhook entity: URL, Events (array), Secret, IsActive
- Create webhook delivery service
- Events to support:
  - portfolio.created, portfolio.updated
  - account.created, account.updated
  - calculation.completed
  - report.generated
  - alert.triggered
- Webhook signing (HMAC signature)
- Retry logic with exponential backoff
- Webhook delivery logs
- Background job for webhook delivery

## Frontend
- Webhook management page (admin)
- Create/edit webhooks
- Test webhook (send test event)
- View webhook delivery logs
- Regenerate secret

## Testing
- Test webhook delivery
- Test signature verification
- Test retry logic
- Test different event types

Execute end-to-end autonomously.
