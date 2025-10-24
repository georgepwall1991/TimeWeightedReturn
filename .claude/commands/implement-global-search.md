# Implement Global Search

Add global search across clients, portfolios, accounts, instruments with autocomplete and advanced filters.

## Backend
- Create search endpoint: POST /api/search
- Search across: Clients, Portfolios, Accounts, Instruments, Users (admin)
- Ranking algorithm (name match, exact match, partial match)
- Recent searches persistence
- Search suggestions
- Optional: Elasticsearch integration for better performance

## Frontend
- Create GlobalSearch component (Cmd+K to trigger)
- Autocomplete dropdown with categorized results
- Keyboard navigation (arrow keys, Enter)
- Recent searches
- Search highlighting
- Navigate to entity on select
- Search filters (entity type, date range)

## Testing
- Test search performance with large datasets
- Test ranking accuracy
- Test fuzzy matching
- Test tenant isolation

## Files
- `src/Application/Features/Search/` (NEW)
- `src/Api/Controllers/SearchController.cs` (NEW)
- `frontend/src/components/search/GlobalSearch.tsx` (NEW)
- `frontend/src/hooks/useGlobalSearch.ts` (NEW)

Execute end-to-end autonomously.
