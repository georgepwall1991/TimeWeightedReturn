# Add Advanced Filtering

Implement advanced filtering system with multi-select, range filters, and custom filter builder.

## Backend
- Add filter support to all list endpoints
- Dynamic query building from filter object
- Saved filters (user-specific)
- Filter templates (predefined useful filters)

## Frontend
- Create AdvancedFilterPanel component
- Multi-select filters: Asset type, Currency, Instrument type, Client
- Range filters: Value range, Performance range, Date range, Risk metrics
- Custom filter builder (AND/OR logic)
- Save filters for reuse
- Filter chips showing active filters
- Clear all filters button
- Apply filters with URL state (shareable filtered views)

## Testing
- Test complex filter combinations
- Test filter persistence
- Test performance with many filters

## Files
- `frontend/src/components/filters/AdvancedFilterPanel.tsx` (NEW)
- `frontend/src/components/filters/FilterBuilder.tsx` (NEW)
- `frontend/src/hooks/useFilters.ts` (NEW)
- Update all list endpoints to support filtering

Execute end-to-end autonomously.
