# Implement Notifications

Complete notification and alerts system with configurable rules, multiple delivery channels, and notification center.

## Backend
- Create Notification entity: Id, OrganizationId, UserId, Type, Title, Message, IsRead, CreatedAt
- Create Alert entity: Id, UserId, AlertType, Conditions (JSON), IsActive, LastTriggered
- Alert types: PerformanceThreshold, RiskAlert, RebalancingNeeded, MissingData
- Alert rules engine (evaluate conditions)
- Background job to check alerts
- Delivery channels: In-app, Email, Browser push (web push), SMS (Twilio ready)
- Notification preferences per user

## Frontend
- Create NotificationCenter component (dropdown from bell icon)
- List notifications, mark as read, clear all
- Toast notifications for important alerts
- Browser push notification permission request
- Notification settings page (configure alert rules)
- Enable/disable notification channels

## Testing
- Test alert triggering
- Test notification delivery
- Test browser push
- Test email notifications

## Files
- `src/Domain/Entities/Notification.cs` (NEW)
- `src/Domain/Entities/Alert.cs` (NEW)
- `src/Infrastructure/Services/AlertService.cs` (NEW)
- `src/Infrastructure/Jobs/AlertCheckJob.cs` (NEW)
- `src/Application/Features/Notifications/` (NEW)
- `frontend/src/components/notifications/NotificationCenter.tsx` (NEW)

Execute end-to-end autonomously.
