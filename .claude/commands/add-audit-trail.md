# Add Audit Trail

You are implementing **Comprehensive Audit Trail** for the Time-Weighted Return application.

## Context
Add enterprise-grade audit logging to track all data changes (Create, Update, Delete) for compliance and debugging. This is essential for financial applications, regulatory compliance (SOX, GDPR), and security incident investigation.

## Implementation Requirements

### Domain Layer

- **Create AuditLog Entity:**
  - `src/Domain/Entities/AuditLog.cs`
    ```csharp
    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid? UserId { get; set; }
        public string UserName { get; set; }
        public string EntityType { get; set; } // e.g., "Portfolio", "Account"
        public string EntityId { get; set; } // Guid as string
        public string Action { get; set; } // "Create", "Update", "Delete"
        public string? OldValues { get; set; } // JSON
        public string? NewValues { get; set; } // JSON
        public string? ChangedProperties { get; set; } // JSON array of property names
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime Timestamp { get; set; }
    }
    ```

- **Create Enum for Audit Actions:**
  - `src/Domain/Enums/AuditAction.cs`
    ```csharp
    public enum AuditAction
    {
        Create,
        Update,
        Delete
    }
    ```

### Infrastructure Layer

- **Update PortfolioContext:**
  - Add `DbSet<AuditLog>`
  - Override `SaveChangesAsync` to capture audit trail
  - Implement audit logic:
    - Get all Modified/Added/Deleted entities
    - Capture old and new values
    - Create AuditLog entries
    - Get current user from IHttpContextAccessor
    - Serialize values to JSON

- **Create Audit Interceptor (Alternative approach):**
  - `src/Infrastructure/Interceptors/AuditInterceptor.cs`
  - Implement `SaveChangesInterceptor` from EF Core
  - Capture entity changes before save
  - Create audit log entries
  - More flexible than overriding SaveChanges

- **Configure Auditable Entities:**
  - Mark entities that should be audited (all domain entities)
  - Consider interface: `IAuditable`
  - Or use attribute: `[Auditable]`

- **Create Migration:**
  - Add AuditLogs table with indexes:
    - Index on OrganizationId
    - Index on EntityType + EntityId
    - Index on Timestamp
    - Index on UserId

### Application Layer

- **Create Audit Queries:**
  - `src/Application/Features/Audit/Queries/GetAuditLogs/`
    - Filter by entity type, entity ID, user, date range
    - Pagination support
    - Return audit log entries with user details

  - `src/Application/Features/Audit/Queries/GetEntityHistory/`
    - Get complete history for a specific entity
    - Show timeline of changes
    - Compare versions

  - `src/Application/Features/Audit/Queries/GetUserActivity/`
    - Get all activity for a specific user
    - For user activity reports

- **Create DTOs:**
  - `AuditLogDto` - audit log entry
  - `AuditLogFilterDto` - filter parameters
  - `EntityChangeDto` - specific property change details

### API Layer

- **Create AuditController:**
  - `src/Api/Controllers/AuditController.cs`
  - Endpoints:
    - `GET /api/audit` - Get audit logs with filters (Admin/Manager only)
    - `GET /api/audit/entity/{type}/{id}` - Get entity history
    - `GET /api/audit/user/{userId}` - Get user activity
    - `GET /api/audit/export` - Export audit trail (CSV/Excel)
  - Require appropriate roles (Admin, Compliance Officer)

- **Update Program.cs:**
  - Register AuditInterceptor or ensure SaveChanges override works
  - Ensure IHttpContextAccessor is registered

### Frontend

- **Create Audit Viewer Component:**
  - `frontend/src/pages/AuditTrail.tsx` (Admin page)
  - Table showing audit logs
  - Filters: date range, entity type, user, action
  - Search by entity ID
  - Export functionality

- **Create Entity History Component:**
  - `frontend/src/components/audit/EntityHistory.tsx`
  - Show timeline of changes for an entity
  - Visual diff of old vs new values
  - Link to view user who made change

- **Create Change Detail Modal:**
  - `frontend/src/components/audit/ChangeDetailModal.tsx`
  - Show detailed before/after comparison
  - Highlight changed properties
  - Format JSON nicely

- **Add Audit Link to Entity Detail Views:**
  - Add "View History" button to:
    - Portfolio detail
    - Account detail
    - Client detail
  - Opens EntityHistory component

### Testing

- Create tests for audit logging:
  - Test entity creation triggers audit log
  - Test entity update captures old and new values
  - Test entity deletion logs correctly
  - Test audit filtering and querying
  - Test cross-tenant isolation (can't see other org's audit logs)

### Security & Compliance

- **Audit Log Integrity:**
  - Audit logs are immutable (no updates/deletes allowed)
  - Only system can create audit logs (not via API)
  - Consider digital signatures for tamper evidence (optional)

- **Retention Policy:**
  - Document retention period (e.g., 7 years for SOX)
  - Add archival strategy
  - Add purge functionality for old logs (Admin only, logged itself)

- **Sensitive Data:**
  - Don't log sensitive fields (passwords, tokens)
  - Add `[AuditIgnore]` attribute for sensitive properties
  - Consider encrypting audit log values

## Acceptance Criteria
- [ ] AuditLog entity created with all properties
- [ ] Migration adds AuditLogs table with indexes
- [ ] SaveChanges override or Interceptor captures changes
- [ ] All Create/Update/Delete operations logged
- [ ] Old and new values serialized to JSON
- [ ] Current user info captured (UserId, UserName)
- [ ] IP address and UserAgent captured
- [ ] OrganizationId included for multi-tenant isolation
- [ ] Audit queries working (filter, pagination)
- [ ] Entity history endpoint working
- [ ] User activity endpoint working
- [ ] Frontend audit trail viewer working
- [ ] Entity history component showing timeline
- [ ] Change detail modal showing diffs
- [ ] Export audit logs to CSV/Excel
- [ ] Audit logs immutable (can't be edited/deleted)
- [ ] Sensitive fields not logged
- [ ] All tests passing
- [ ] No console errors

## Related Files
- `src/Domain/Entities/AuditLog.cs` (NEW)
- `src/Domain/Enums/AuditAction.cs` (NEW)
- `src/Infrastructure/Data/PortfolioContext.cs`
- `src/Infrastructure/Interceptors/AuditInterceptor.cs` (NEW - if using interceptor approach)
- `src/Infrastructure/Data/Migrations/` (NEW migration)
- `src/Application/Features/Audit/` (NEW folder)
- `src/Api/Controllers/AuditController.cs` (NEW)
- `src/Api/Program.cs`
- `frontend/src/pages/AuditTrail.tsx` (NEW)
- `frontend/src/components/audit/EntityHistory.tsx` (NEW)
- `frontend/src/components/audit/ChangeDetailModal.tsx` (NEW)
- `frontend/src/services/api.ts`

## Implementation Notes
- Use EF Core SaveChangesInterceptor for cleaner implementation
- Serialize to JSON using System.Text.Json
- Consider max size for OldValues/NewValues (may need to truncate large objects)
- Index heavily for query performance
- Consider separate database for audit logs (future optimization)
- Add background job to archive old audit logs
- Document what is audited vs what isn't
- Consider using Change Data Capture (CDC) for database-level auditing (advanced)

## Example Audit Log Entry
```json
{
  "id": "...",
  "organizationId": "...",
  "userId": "...",
  "userName": "john.doe@example.com",
  "entityType": "Portfolio",
  "entityId": "...",
  "action": "Update",
  "oldValues": "{\"Name\":\"Old Portfolio Name\",\"UpdatedAt\":\"2024-01-01\"}",
  "newValues": "{\"Name\":\"New Portfolio Name\",\"UpdatedAt\":\"2024-01-15\"}",
  "changedProperties": "[\"Name\",\"UpdatedAt\"]",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Execute this implementation end-to-end autonomously.
