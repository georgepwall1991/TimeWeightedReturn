# Implement Caching Strategy

Add caching to all expensive operations: TWR calculations, price data, permissions, and organization settings.

## Backend
- Cache TWR calculations (key: accountId + date range, expiry: 1 hour or on data change)
- Cache price data (expiry: daily at market close)
- Cache user permissions (invalidate on role change)
- Cache organization settings (long expiry, invalidate on update)
- Cache portfolio tree structure (invalidate on structure change)
- Cache aggregated statistics
- Implement cache-aside pattern
- Cache invalidation on entity updates (use audit trail triggers)
- Add cache warming on application startup
- Cache metrics (hit/miss ratio)

## Implementation
- Update all calculation handlers to check cache first
- Update all entity update handlers to invalidate cache
- Add `[CacheOutput]` attribute to API endpoints (if using ASP.NET Output Caching)
- Add cache statistics endpoint for monitoring

## Testing
- Test cache improves performance
- Test cache invalidation on updates
- Test cache warming
- Load test with and without cache

## Files
- Update all calculation services
- Update all command handlers (invalidate cache on writes)
- Add cache configuration

Execute end-to-end autonomously.
