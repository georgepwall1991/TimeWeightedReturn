# Add Real-Time Updates

Implement real-time features using SignalR: live price updates, portfolio value updates, user presence, and live notifications.

## Backend
- Broadcast price updates when prices change
- Broadcast portfolio value changes
- Track user presence (who's viewing what)
- Send live notifications to users
- Efficient updates (only send diffs, group notifications)
- Rate limiting to prevent spam

## Frontend
- Subscribe to price updates for current view
- Update charts in real-time
- Show user presence indicators
- Display live notifications (toast/banner)
- Optimistic UI updates
- Handle connection state (online/offline indicator)

## Testing
- Test real-time price updates
- Test notification delivery
- Test presence tracking
- Test performance with many concurrent users

## Files
- `src/Infrastructure/Hubs/PortfolioHub.cs` (expand)
- `src/Application/Events/` (NEW - domain events)
- `frontend/src/hooks/useRealtimeUpdates.ts` (NEW)

Execute end-to-end autonomously.
