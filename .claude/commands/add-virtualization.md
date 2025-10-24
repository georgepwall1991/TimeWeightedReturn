# Add Virtualization

Implement virtual scrolling for large datasets using react-window to improve performance.

## Frontend
- Add react-window library
- Update HoldingsTable to use virtualization
  - Use FixedSizeList or VariableSizeList
  - Render only visible rows
  - Smooth scrolling
- Add virtualization to other large tables:
  - Audit trail viewer
  - Transaction history
  - Activity logs
- Infinite scroll for activity feeds (load more on scroll)
- Lazy loading for charts (load chart data on demand)
- Code splitting for heavy components (React.lazy)

## Performance
- Measure before/after performance
- Test with 10K+ row datasets
- Profile render performance
- Optimize re-renders with React.memo

## Testing
- Test scrolling smoothness
- Test row rendering accuracy
- Test with different row counts
- Test keyboard navigation still works

## Files
- `frontend/src/components/holdings/HoldingsTable.tsx`
- `frontend/src/components/audit/AuditTrailTable.tsx`
- Other large table components

Execute end-to-end autonomously.
