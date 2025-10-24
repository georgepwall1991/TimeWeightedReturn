# Setup SignalR

Set up SignalR infrastructure for real-time communication between server and clients.

## Backend
- Add Microsoft.AspNetCore.SignalR NuGet package
- Create PortfolioHub: `src/Infrastructure/Hubs/PortfolioHub.cs`
- Hub methods: JoinPortfolio, LeavePortfolio, SendNotification, BroadcastUpdate
- Add SignalR to Program.cs (AddSignalR, MapHub)
- Configure CORS for SignalR
- Add authentication to hub (require JWT)

## Frontend
- Add @microsoft/signalr package
- Create signalRService: `frontend/src/services/signalRService.ts`
- Connection management (connect, disconnect, reconnect)
- Subscribe to events
- Connection status indicator in UI
- Automatic reconnection with exponential backoff

## Testing
- Test connection establishment
- Test authentication
- Test message delivery
- Test reconnection on disconnect

## Files
- `src/Infrastructure/Hubs/PortfolioHub.cs` (NEW)
- `src/Api/Program.cs`
- `frontend/src/services/signalRService.ts` (NEW)
- `frontend/src/hooks/useSignalR.ts` (NEW)

Execute end-to-end autonomously.
