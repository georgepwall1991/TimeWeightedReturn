# Implement Soft Delete

Add soft delete functionality to all entities with restore capability and data archival.

## Backend
- Add to ALL domain entities:
  - IsDeleted (bool, default: false)
  - DeletedAt (DateTime?)
  - DeletedBy (Guid? - UserId)
- Create soft delete interceptor or override SaveChanges
- Configure global query filter to exclude soft-deleted by default
- Add IgnoreQueryFilters() method for admin views
- Create restore functionality
- Permanent deletion after retention period (e.g., 90 days)
- Background job to permanently delete old soft-deleted records

## Application Layer
- Update Delete commands to soft delete instead
- Create Restore commands
- Create PermanentDelete commands (admin only)
- Add "Include deleted" option to queries (admin only)

## API Layer
- Delete endpoints now soft delete
- Add restore endpoints
- Add permanent delete endpoints (admin only)
- Add endpoint to list deleted items (admin)

## Frontend
- Show "Deleted" badge on soft-deleted items (if viewing as admin)
- Add "Restore" button
- Confirmation for permanent deletion
- Trash/Recycle bin view (admin page showing deleted items)

## Testing
- Test soft delete sets flags correctly
- Test global filter excludes deleted
- Test restore functionality
- Test permanent deletion

## Files
- Update ALL domain entities
- `src/Infrastructure/Interceptors/SoftDeleteInterceptor.cs` (NEW)
- Update all Delete command handlers
- Create Restore command handlers
- `frontend/src/pages/RecycleBin.tsx` (NEW - admin)

Execute end-to-end autonomously.
