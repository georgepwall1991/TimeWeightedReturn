# Playwright E2E Testing Suite

Comprehensive end-to-end testing infrastructure for the Time-Weighted Return application.

## Quick Start

### Prerequisites

1. Ensure backend API is running: `http://localhost:5011`
2. Ensure frontend dev server is running: `http://localhost:5174`
3. Install Playwright browsers (first time only):

```bash
npm run playwright:install
```

### Running Tests

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see the browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run only Chromium tests
npm run test:e2e:chromium

# View test report
npm run test:report
```

### Running Site Auditor

```bash
# Run comprehensive site examination
npm run test:audit
```

This will generate a detailed report in `audit-reports/` with:
- Bug detection
- Visual issues
- Accessibility problems
- Performance metrics
- UX improvements
- Feature completeness checks

## Test Structure

```
tests/
├── e2e/                    # Feature tests
│   ├── auth/              # Authentication (login, register, etc.)
│   ├── portfolio/         # Portfolio navigation & management
│   ├── analytics/         # Analytics dashboards
│   ├── benchmarks/        # Benchmark CRUD operations
│   ├── holdings/          # Holdings explorer
│   └── theme/             # Dark mode & theming
├── fixtures/              # Test fixtures
│   ├── auth.fixture.ts    # Auth helpers & authenticated page fixture
│   └── pages.fixture.ts   # Page Object Models
├── utils/                 # Test utilities
│   └── test-helpers.ts    # Helper functions
├── audit/                 # Site examination scripts
│   └── site-auditor.ts    # Main audit script
└── visual/                # Visual regression tests
```

## Test Patterns

### Using Authenticated Fixture

```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test('should access protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.locator('text=Portfolio Overview')).toBeVisible();
});
```

### Using Page Object Models

```typescript
import { LoginPage } from '../../fixtures/pages.fixture';

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@timeweightedreturn.com', 'Admin@123');
});
```

### Using Test Helpers

```typescript
import { waitForAPI, isDarkMode, takeScreenshot } from '../../utils/test-helpers';

test('example', async ({ page }) => {
  await waitForAPI(page, '/api/tree');
  const darkMode = await isDarkMode(page);
  await takeScreenshot(page, 'example-screenshot');
});
```

## Configuration

Test configuration is defined in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, Mobile (Pixel 5, iPhone 12), Tablet (iPad Pro)
- **Retries**: 2 retries on CI, 0 locally
- **Parallel**: Enabled for faster execution
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Continuous Integration

Tests are configured for CI with:
- JUnit XML reports
- HTML reports
- JSON results
- Automatic retries
- Screenshot/video artifacts on failure

## Best Practices

1. **Independent Tests**: Each test should be able to run independently
2. **API Setup**: Use API calls to set up test state (faster than UI)
3. **Deterministic Waits**: Use `waitForSelector`, `waitForURL`, etc. instead of `waitForTimeout`
4. **Page Objects**: Use Page Object Model for maintainability
5. **Fixtures**: Use fixtures for authenticated states
6. **Clear Naming**: Test names should describe behavior, not implementation
7. **Assertions**: Use multiple specific assertions rather than one broad assertion
8. **Cleanup**: Tests are automatically isolated, but explicit cleanup is good practice

## Debugging

### Debug a Specific Test

```bash
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### Open Playwright Inspector

```bash
npx playwright test --debug
```

### View Trace

```bash
npx playwright show-trace trace.zip
```

## Writing New Tests

### 1. Choose the Right Directory

Place tests in the appropriate feature directory:
- Auth flows → `tests/e2e/auth/`
- Portfolio features → `tests/e2e/portfolio/`
- Analytics → `tests/e2e/analytics/`
- etc.

### 2. Use Fixtures

Import the authenticated fixture for protected routes:

```typescript
import { test, expect } from '../../fixtures/auth.fixture';
```

### 3. Create Page Objects (if needed)

For complex pages, create a Page Object in `tests/fixtures/pages.fixture.ts`

### 4. Follow Naming Convention

```typescript
test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Test implementation
  });
});
```

## Slash Commands

### `/Playwright`

Runs the complete E2E test suite:
- Checks if servers are running
- Executes all tests in parallel
- Generates HTML report
- Shows summary with pass/fail counts

### `/Playwright-examine`

Runs comprehensive site examination:
- Logs in as admin
- Navigates all routes
- Checks for bugs, visual issues, accessibility problems
- Measures performance
- Generates detailed markdown report with screenshots

## Troubleshooting

### Tests Failing with "Server not running"

Ensure both servers are running:
```bash
# Terminal 1: Backend
cd ..
dotnet run --project src/Api/Api.csproj

# Terminal 2: Frontend
npm run dev
```

### Browser Not Installed

```bash
npm run playwright:install
```

### Tests Timing Out

Increase timeout in `playwright.config.ts` or specific test:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

### Flaky Tests

- Use proper waits (`waitForSelector`, `waitForLoadState`)
- Avoid hardcoded `waitForTimeout`
- Enable retries in config
- Check for race conditions

## Contributing

When adding new features to the application:

1. Write E2E tests for the new feature
2. Add tests to appropriate directory
3. Update this README if needed
4. Run tests before committing: `npm run test:e2e`
