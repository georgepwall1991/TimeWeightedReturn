# Add Activity Logging

You are implementing **User Activity Logging** for the Time-Weighted Return application.

## Context
Track user actions and API calls beyond just data changes (which audit trail covers). Activity logging tracks searches, views, exports, logins, and other user interactions for security monitoring, usage analytics, and UX improvements.

## Implementation Requirements

### Domain Layer

- **Create ActivityLog Entity:**
  - `src/Domain/Entities/ActivityLog.cs`
  - Properties: Id, OrganizationId, UserId, UserName, ActivityType, Description, EntityType, EntityId, Metadata (JSON), IpAddress, UserAgent, Duration (ms), Timestamp

- **Create ActivityType Enum:**
  - Login, Logout, View, Search, Export, Calculate, ApiCall, ErrorOccurred, etc.

### Infrastructure Layer

- **Create Activity Logging Service:**
  - `src/Infrastructure/Services/ActivityLogService.cs`
  - Interface: `IActivityLogService`
  - Methods: LogActivity, LogApiCall, LogSearch, LogExport, LogCalculation
  - Async logging (don't block main request)

- **Create Activity Logging Middleware:**
  - `src/Infrastructure/Middleware/ActivityLoggingMiddleware.cs`
  - Log all API calls automatically
  - Capture request path, method, status code, duration
  - Store in ActivityLog table

- **Add Migration:**
  - Create ActivityLogs table
  - Indexes on OrganizationId, UserId, ActivityType, Timestamp

### Application Layer

- **Create Activity Queries:**
  - GetActivityLogs (with filtering and pagination)
  - GetUserActivity (specific user's activities)
  - GetActivityStats (aggregated statistics)
  - GetRecentActivity (feed of recent actions)

- **Integrate Logging in Handlers:**
  - Log expensive calculations (TWR, Attribution)
  - Log search operations
  - Log data exports
  - Log important views (portfolio views, report generation)

### API Layer

- **Create ActivityController:**
  - GET /api/activity - Get activity logs (Admin only)
  - GET /api/activity/user/{userId} - User's activity
  - GET /api/activity/recent - Recent activity feed
  - GET /api/activity/stats - Usage statistics

- **Register Middleware:**
  - Add ActivityLoggingMiddleware to pipeline

### Frontend

- **Create Activity Feed Component:**
  - `frontend/src/components/activity/ActivityFeed.tsx`
  - Show recent user activities
  - Real-time updates (optional)
  - Filter by activity type

- **Create Activity Dashboard:**
  - `frontend/src/pages/ActivityDashboard.tsx` (Admin)
  - Charts: Activities over time, top users, popular features
  - Tables: Recent activities, error logs
  - Export activity data

- **Add Activity Indicators:**
  - Show "Recently viewed" portfolios
  - Show user presence ("User X is viewing...")
  - Activity timeline on user profile

### Testing

- Test activity logging doesn't impact performance
- Test filtering and querying
- Test async logging works correctly
- Test tenant isolation

## Acceptance Criteria
- [ ] ActivityLog entity created
- [ ] ActivityLogService implemented
- [ ] ActivityLoggingMiddleware logs API calls
- [ ] Manual activity logging in key handlers
- [ ] Activity queries working with filters
- [ ] ActivityController endpoints working
- [ ] Activity feed component displaying activities
- [ ] Activity dashboard for admins
- [ ] Async logging doesn't block requests
- [ ] All tests passing

## Related Files
- `src/Domain/Entities/ActivityLog.cs` (NEW)
- `src/Infrastructure/Services/ActivityLogService.cs` (NEW)
- `src/Infrastructure/Middleware/ActivityLoggingMiddleware.cs` (NEW)
- `src/Application/Features/Activity/` (NEW)
- `src/Api/Controllers/ActivityController.cs` (NEW)
- `frontend/src/components/activity/ActivityFeed.tsx` (NEW)
- `frontend/src/pages/ActivityDashboard.tsx` (NEW)

Execute this implementation end-to-end autonomously.
