# Setup Background Jobs

Implement Hangfire for background job processing with dashboard and monitoring.

## Backend
- Add Hangfire NuGet packages (Hangfire.Core, Hangfire.SqlServer)
- Configure Hangfire in Program.cs
- Use SQLite for job storage (or separate SQL Server)
- Add Hangfire dashboard at /hangfire (require Admin role)
- Configure job retention, retry policies
- Add job filters for logging and error handling

## Infrastructure
- Create Jobs folder: `src/Infrastructure/Jobs/`
- Job base class or interface
- Job registration service

## Frontend
- Link to Hangfire dashboard from admin menu
- Or embed dashboard in admin panel (iframe)

## Testing
- Test job execution
- Test retry on failure
- Test dashboard access control

## Files
- `src/Infrastructure/Jobs/` (NEW folder)
- `src/Api/Program.cs`
- Add Hangfire tables to database

Execute end-to-end autonomously.
