# Run End-to-End Tests

Run the comprehensive Playwright E2E test suite for the Time-Weighted Return application.

## Test Coverage

The test suite covers:
- **Authentication**: Login, registration, password reset
- **Portfolio Management**: Client, portfolio, and account navigation
- **Analytics**: TWR calculations, contribution analysis, attribution, risk metrics
- **Benchmarks**: CRUD operations and comparisons
- **Holdings**: Explorer and data views
- **Theme**: Dark mode consistency
- **Accessibility**: ARIA compliance, keyboard navigation
- **Visual Regression**: Screenshot comparisons

## Running Tests

Execute the complete test suite with proper setup and teardown, including:
1. Check that backend API is running (http://localhost:5011)
2. Check that frontend dev server is running (http://localhost:5174)
3. Run all E2E tests in parallel
4. Generate HTML report with screenshots/videos of failures
5. Display summary of results with pass/fail counts

## Test Organization

Tests are organized by feature:
- `tests/e2e/auth/` - Authentication flows
- `tests/e2e/portfolio/` - Portfolio navigation and management
- `tests/e2e/analytics/` - Analytics dashboards and calculations
- `tests/e2e/benchmarks/` - Benchmark management
- `tests/e2e/holdings/` - Holdings explorer
- `tests/e2e/theme/` - Theme switching and dark mode

## Best Practices

- Tests use **Page Object Model** for maintainability
- **Fixtures** provide authenticated states and test data
- Tests are **independent** and can run in any order
- API calls are used for fast test setup
- Automatic retries for flaky tests
- Screenshots and traces captured on failure

Run the tests and provide a summary of results, including any failures that need attention.
