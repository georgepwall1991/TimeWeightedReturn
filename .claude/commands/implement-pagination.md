# Implement Pagination

Add pagination to all list endpoints and UI components with page size selection and cursor-based options.

## Backend
- Create `PagedResult<T>` wrapper class
- Properties: Items, Page, PageSize, TotalCount, TotalPages, HasNextPage, HasPreviousPage
- Update all list query handlers to return PagedResult
- Add pagination parameters to all list queries (Page, PageSize, optional SortBy, SortOrder)
- Implement cursor-based pagination for real-time data (ActivityLog, Notifications)
- Default and maximum page sizes (default: 20, max: 100)

## Frontend
- Create PaginationControls component
- Page navigation: First, Previous, Next, Last
- Page number buttons (with ellipsis for many pages)
- Page size selector (10, 20, 50, 100)
- Total count display ("Showing 1-20 of 150")
- Update all list components to use pagination
- URL state for pagination (shareable paginated views)

## Testing
- Test pagination math (total pages calculation)
- Test edge cases (empty list, single page, last page)
- Test page size changes
- Test sorting with pagination

## Files
- `src/Application/Common/Models/PagedResult.cs` (NEW)
- Update ALL list query handlers
- `frontend/src/components/common/PaginationControls.tsx` (NEW)
- Update all list components

Execute end-to-end autonomously.
