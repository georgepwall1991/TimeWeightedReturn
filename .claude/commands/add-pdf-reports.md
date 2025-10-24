# Add PDF Reports

Implement PDF report generation using QuestPDF with templates for performance, attribution, risk, and custom reports.

## Backend
- Add QuestPDF NuGet package
- Create report service: `PdfReportService`
- Report templates:
  - Portfolio Performance Report (TWR charts, holdings breakdown)
  - Client Statement (multi-portfolio summary)
  - Attribution Analysis Report
  - Risk Metrics Report
  - Custom Report Builder
- Organization branding (logo, colors, footer)
- Generate reports in background jobs
- Email delivery option
- Report scheduling

## Frontend
- Create ReportBuilder component
- Preview reports before generation
- Schedule reports UI
- Report templates library
- Custom report configuration
- Report history/downloads

## Testing
- Test PDF generation
- Test white-labeling
- Test large reports (100+ page

s)
- Test email delivery

## Files
- `src/Infrastructure/Services/PdfReportService.cs` (NEW)
- `src/Application/Features/Reports/` (NEW)
- `src/Api/Controllers/ReportsController.cs` (NEW)
- `frontend/src/components/reports/ReportBuilder.tsx` (NEW)
- `frontend/src/pages/Reports.tsx` (NEW)

Execute end-to-end autonomously.
