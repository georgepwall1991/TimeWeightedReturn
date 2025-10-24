# Expand Data Export

Expand export capabilities beyond holdings to include TWR analysis, transactions, audit logs, and bulk exports across multiple entities.

##

 Backend
- Add export endpoints for: Portfolio summary, TWR analysis results, Transaction history, Audit trail, User activity, Bulk exports (all portfolios for a client)
- Support CSV, Excel, JSON formats
- Add export templates/configurations
- Add export scheduling (save export configs, run on schedule)

## Frontend
- Create ExportWizard component for bulk exports
- Add export history page
- Add scheduled exports management
- Export progress indicators for large datasets

## Files
- `src/Api/Controllers/ExportController.cs` (NEW - centralized export)
- `src/Application/Features/Export/` (NEW)
- `frontend/src/components/export/ExportWizard.tsx` (NEW)
- `frontend/src/pages/ExportHistory.tsx` (NEW)

Execute end-to-end autonomously.
