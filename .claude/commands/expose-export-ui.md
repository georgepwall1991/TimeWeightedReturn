# Expose Export UI

You are implementing **Export UI** for the Time-Weighted Return application.

## Context
The backend already has an export endpoint (`GET /api/accounts/{accountId}/holdings/export`) that supports CSV and Excel formats, but there's no UI to access it. This command adds user-friendly export functionality throughout the application.

## Implementation Requirements

### Backend
- **Review existing export endpoint** at `AccountController.ExportHoldings`
- **Add additional export endpoints if needed:**
  - `GET /api/portfolio/{portfolioId}/export` - Export portfolio summary
  - `GET /api/account/{accountId}/twr/export` - Export TWR analysis results
  - `GET /api/account/{accountId}/transactions/export` - Export transaction history
- Ensure all export endpoints:
  - Support both CSV and Excel formats
  - Include proper Content-Type headers
  - Have descriptive filenames with dates
  - Handle empty data gracefully

### Frontend
- **Create Export Components:**
  - `frontend/src/components/common/ExportButton.tsx`
    - Dropdown button with format selection (CSV/Excel)
    - Loading state during export
    - Success/error toast notifications
    - Optional date range selector

  - `frontend/src/components/common/ExportDropdown.tsx`
    - Format selection menu
    - Optional advanced options (date range, filters)
    - Quick export vs custom export

- **Add Export API Methods:**
  - Update `frontend/src/services/api.ts` with export endpoints
  - Handle blob responses for file downloads
  - Trigger browser download automatically

- **Integrate into Existing Components:**
  - `HoldingsExplorer.tsx` - Add export button to toolbar
  - `AccountOverview.tsx` - Add export button for account data
  - `PortfolioOverview.tsx` - Add export button for portfolio summary
  - `TwrCalculator.tsx` or analytics views - Add export for analysis results

- **Export Utility Functions:**
  - Create `frontend/src/utils/exportHelpers.ts`
  - `downloadBlob(blob, filename)` - Trigger file download
  - `generateFilename(type, date, format)` - Create descriptive filenames

### Testing
- Test CSV export opens correctly in Excel/Google Sheets
- Test Excel export with proper formatting and headers
- Test large datasets don't timeout
- Test error handling (no data, network errors)

### Documentation
- Add export feature description to README
- Document supported export formats
- Add user guide for exports if needed

## Acceptance Criteria
- [ ] ExportButton component created and reusable
- [ ] Export integrated into HoldingsExplorer
- [ ] Export integrated into AccountOverview
- [ ] Export integrated into analytics/TWR views
- [ ] Both CSV and Excel formats working
- [ ] Files download with descriptive names (e.g., `holdings-2024-01-15.xlsx`)
- [ ] Loading states during export
- [ ] Error handling with user-friendly messages
- [ ] Toast notifications on success/error
- [ ] All tests passing
- [ ] No console errors

## Related Files
- `src/Api/Controllers/AccountController.cs` (review existing export)
- `src/Api/Controllers/PortfolioController.cs` (add export if needed)
- `frontend/src/components/common/ExportButton.tsx` (NEW)
- `frontend/src/components/holdings/HoldingsExplorer.tsx`
- `frontend/src/components/analytics/AccountOverview.tsx`
- `frontend/src/services/api.ts`
- `frontend/src/utils/exportHelpers.ts` (NEW)

## Implementation Notes
- Use `Content-Disposition: attachment` header for downloads
- Include proper MIME types: `text/csv` and `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Consider adding export progress indicator for large datasets
- Ensure exports respect user permissions (authorization)

Execute this implementation end-to-end autonomously.
