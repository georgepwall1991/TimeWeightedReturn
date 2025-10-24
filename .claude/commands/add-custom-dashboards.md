# Add Custom Dashboards

Implement customizable dashboard with drag-drop widgets and dashboard templates.

## Backend
- Create DashboardLayout entity (stores widget positions per user)
- Create DashboardWidget entity (widget configurations)
- Endpoints: Get/save dashboard layout, Get widget data
- Widget types: PerformanceSummary, TopPerformers, RecentActivity, Alerts, PortfolioValue, Allocation, etc.

## Frontend
- Add react-grid-layout library
- Create Dashboard page
- Widget library:
  - PerformanceSummaryWidget
  - TopPerformersWidget
  - RecentActivityWidget
  - AlertsWidget
  - PortfolioValueWidget
  - AllocationChartWidget
  - RiskMetricsWidget
  - QuickActionsWidget
- Drag-drop widget positioning
- Resize widgets
- Add/remove widgets
- Dashboard templates (Analyst, Manager, Executive)
- Multiple dashboard support
- Share dashboard layouts
- Export/import dashboard configs

## Testing
- Test drag-drop functionality
- Test layout persistence
- Test widget data loading
- Test responsive design

## Files
- `src/Domain/Entities/DashboardLayout.cs` (NEW)
- `src/Application/Features/Dashboards/` (NEW)
- `frontend/src/pages/Dashboard.tsx` (NEW)
- `frontend/src/components/dashboard/Widget.tsx` (NEW)
- `frontend/src/components/dashboard/widgets/` (NEW folder)

Execute end-to-end autonomously.
