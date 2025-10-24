# Implement Data Import

Complete data import system with CSV upload, validation, mapping, and error handling for holdings, transactions, and price data.

## Backend
- Create import endpoints for: Holdings, Transactions/CashFlows, Price data, Instruments
- CSV parsing with CsvHelper
- Validation with detailed error reporting
- Preview before commit
- Transaction support (rollback on error)
- Import history tracking
- Template download endpoints

## Frontend
- Create ImportWizard component:
  - Step 1: Upload file (drag-drop)
  - Step 2: Map CSV columns to fields
  - Step 3: Preview data with validation errors
  - Step 4: Confirm and import
  - Step 5: Results summary
- File upload with progress
- Download import templates
- Import history page
- Error display with line numbers

## Testing
- Test large file uploads (10K+ rows)
- Test validation catches errors
- Test rollback on failure
- Test CSV encoding (UTF-8, Latin1)

## Files
- `src/Application/Features/Import/` (NEW)
- `src/Api/Controllers/ImportController.cs` (NEW)
- `frontend/src/components/import/ImportWizard.tsx` (NEW)
- `frontend/src/pages/ImportHistory.tsx` (NEW)

Execute end-to-end autonomously.
