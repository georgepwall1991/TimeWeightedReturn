# Setup Redis Cache

Set up Redis distributed caching infrastructure for multi-instance deployments and improved performance.

## Backend
- Add StackExchange.Redis NuGet package
- Configure Redis connection in appsettings.json
- Create CacheService wrapper: `src/Infrastructure/Services/CacheService.cs`
- Interface: `ICacheService` with Get, Set, Remove, GetOrSet methods
- Support for different expiration strategies
- Fallback to memory cache if Redis unavailable

## Infrastructure
- Update docker-compose.yml to include Redis service
- Add Redis to production deployment config
- Configure connection pooling
- Add Redis health check

## Testing
- Test cache get/set/remove
- Test expiration
- Test Redis unavailability fallback
- Test performance improvement

## Files
- `src/Infrastructure/Services/CacheService.cs` (NEW)
- `src/Api/Program.cs`
- `docker-compose.yml`
- `appsettings.json`

Execute end-to-end autonomously.
