# Add Portfolio Scenarios

Implement what-if analysis and scenario modeling to test allocation changes and market scenarios.

## Backend
- Create Scenario entity: Id, OrganizationId, UserId, Name, Description, PortfolioId, Modifications (JSON), CreatedAt
- Scenario modifications: Allocation changes, Hypothetical holdings, Market condition simulations
- Calculate TWR/metrics for scenarios
- Compare multiple scenarios side-by-side
- Scenario templates (market crash -20%, bull market +30%, high inflation, etc.)
- Monte Carlo simulation (optional, probabilistic forecasting)
- Save and share scenarios

## Frontend
- Create ScenarioBuilder component
- Step 1: Select base portfolio
- Step 2: Apply modifications (drag-drop allocation changes, add/remove holdings)
- Step 3: Set market conditions
- Step 4: Run analysis
- Results: Compare scenario vs baseline (charts, metrics)
- Scenario library (saved scenarios)
- Share scenario link

## Testing
- Test scenario calculations
- Test scenario comparison
- Test scenario persistence
- Test templates

## Files
- `src/Domain/Entities/Scenario.cs` (NEW)
- `src/Application/Features/Scenarios/` (NEW)
- `frontend/src/components/scenarios/ScenarioBuilder.tsx` (NEW)
- `frontend/src/pages/Scenarios.tsx` (NEW)

Execute end-to-end autonomously.
