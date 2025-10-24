# Add Background Job Tasks

Implement specific background jobs: report generation, large imports, bulk calculations, emails, and data cleanup.

## Jobs to Implement

1. **ReportGenerationJob** - Generate PDF reports in background
2. **LargeImportJob** - Process large CSV imports asynchronously
3. **BulkCalculationJob** - Calculate TWR for all portfolios (scheduled daily)
4. **EmailSendingJob** - Queue and send emails with retry
5. **DataCleanupJob** - Archive/delete old data (scheduled weekly)
6. **CacheWarmingJob** - Pre-warm cache on startup
7. **AlertCheckJob** - Check alert conditions (scheduled every 15 min)
8. **UsageTrackingJob** - Aggregate usage statistics (daily)

## Implementation
- Each job implements IJob interface
- Jobs accept parameters (IDs, user context)
- Progress tracking for long-running jobs
- Notification on job completion/failure
- Scheduled recurring jobs

## Frontend
- Job status indicator in UI
- Progress bar for background operations
- Notification when job completes
- Job history page (admin)

## Testing
- Test each job type
- Test retry logic
- Test scheduled jobs trigger correctly

## Files
- `src/Infrastructure/Jobs/*Job.cs` (NEW - one per job type)
- Register jobs in Program.cs

Execute end-to-end autonomously.
