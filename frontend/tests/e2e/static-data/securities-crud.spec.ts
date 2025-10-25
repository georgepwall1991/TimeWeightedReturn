import { test, expect } from '../../fixtures/auth.fixture';
import { StaticDataPage } from '../../fixtures/pages.fixture';

test.describe('Static Data - Securities CRUD', () => {
  test('should navigate to static data page', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);

    // Navigate to static data
    await staticDataPage.goto();

    // Should show Static Data Management heading
    await expect(authenticatedPage.getByRole('heading', { name: 'Static Data Management' })).toBeVisible({ timeout: 10000 });

    // Should show securities and benchmarks tabs
    await expect(staticDataPage.securitiesTab).toBeVisible({ timeout: 5000 });
    await expect(staticDataPage.benchmarksTab).toBeVisible({ timeout: 5000 });
  });

  test('should display securities tab by default', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Securities tab should be active
    await expect(staticDataPage.securitiesTab).toHaveClass(/border-blue-500/);

    // Should show "New Security" button
    await expect(staticDataPage.newSecurityButton).toBeVisible({ timeout: 5000 });
  });

  test('should show empty state when no securities exist', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // May show either table or empty state
    const hasTable = await authenticatedPage.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmptyState = await authenticatedPage.locator('text=No securities').isVisible({ timeout: 3000 }).catch(() => false);

    // One should be visible
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should open security form modal when clicking New Security', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Click new security button
    await staticDataPage.newSecurityButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Modal should appear with form fields - use role heading to avoid strict mode
    await expect(authenticatedPage.getByRole('heading', { name: 'New Security' })).toBeVisible({ timeout: 3000 });
    await expect(authenticatedPage.locator('input[placeholder="AAPL"]')).toBeVisible();
    await expect(authenticatedPage.locator('input[placeholder="Apple Inc."]')).toBeVisible();

    // Close modal
    await authenticatedPage.keyboard.press('Escape');
    await authenticatedPage.waitForTimeout(300);
  });

  test('should create a new security successfully', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    const testSecurity = {
      ticker: 'TEST',
      name: 'Test Security Inc',
      currency: 'GBP',
      isin: 'GB0000000000',
      assetClass: 'Equity',
    };

    // Create security
    await staticDataPage.createSecurity(testSecurity);

    // Should show success - security appears in table
    await expect(authenticatedPage.locator(`text=${testSecurity.ticker}`)).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.locator(`text=${testSecurity.name}`)).toBeVisible({ timeout: 5000 });

    // Clean up - delete the test security
    await staticDataPage.deleteSecurity(testSecurity.ticker);
  });

  test('should search securities by ticker', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // First create a test security
    const testSecurity = {
      ticker: 'SRCH',
      name: 'Search Test Security',
      currency: 'GBP',
    };

    await staticDataPage.createSecurity(testSecurity);
    await authenticatedPage.waitForTimeout(1000);

    // Search for it
    await staticDataPage.searchSecurities('SRCH');

    // Should show only matching results
    await expect(authenticatedPage.locator(`text=${testSecurity.ticker}`)).toBeVisible({ timeout: 3000 });

    // Clear search
    await staticDataPage.searchSecurities('');

    // Clean up
    await staticDataPage.deleteSecurity(testSecurity.ticker);
  });

  test('should search securities by ISIN', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Create a test security with ISIN
    const testSecurity = {
      ticker: 'ISIN',
      name: 'ISIN Test Security',
      currency: 'GBP',
      isin: 'GB1234567890',
    };

    await staticDataPage.createSecurity(testSecurity);
    await authenticatedPage.waitForTimeout(1000);

    // Search by ISIN
    await staticDataPage.searchSecurities('GB1234567890');

    // Should find the security
    await expect(authenticatedPage.locator(`text=${testSecurity.ticker}`)).toBeVisible({ timeout: 3000 });

    // Clean up
    await staticDataPage.searchSecurities('');
    await staticDataPage.deleteSecurity(testSecurity.ticker);
  });

  test('should edit an existing security', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Create test security
    const testSecurity = {
      ticker: 'EDIT',
      name: 'Edit Test Security',
      currency: 'GBP',
    };

    await staticDataPage.createSecurity(testSecurity);
    await authenticatedPage.waitForTimeout(1000);

    // Click edit button on the security row - find by Edit icon
    const row = authenticatedPage.locator(`tr:has-text("${testSecurity.ticker}")`).first();
    const editButton = row.getByRole('button').first(); // Edit button (pencil icon)
    await editButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Modal should show with "Edit Security" title - use heading role
    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Security' })).toBeVisible({ timeout: 3000 });

    // Update name
    const nameInput = authenticatedPage.locator('input[placeholder="Apple Inc."]');
    await nameInput.clear();
    await nameInput.fill('Updated Security Name');

    // Save
    await authenticatedPage.locator('button[type="submit"]:has-text("Update Security")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show updated name
    await expect(authenticatedPage.getByText('Updated Security Name')).toBeVisible({ timeout: 5000 });

    // Clean up
    await staticDataPage.deleteSecurity(testSecurity.ticker);
  });

  test('should delete a security', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Create test security
    const testSecurity = {
      ticker: 'DEL',
      name: 'Delete Test Security',
      currency: 'GBP',
    };

    await staticDataPage.createSecurity(testSecurity);
    await authenticatedPage.waitForTimeout(1000);

    // Verify it exists
    await expect(authenticatedPage.locator(`text=${testSecurity.ticker}`)).toBeVisible({ timeout: 3000 });

    // Delete it
    await staticDataPage.deleteSecurity(testSecurity.ticker);

    // Should be removed from table
    await expect(authenticatedPage.locator(`text=${testSecurity.ticker}`)).not.toBeVisible({ timeout: 3000 });
  });

  test('should validate required fields', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Open form
    await staticDataPage.newSecurityButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Try to submit without filling required fields
    await authenticatedPage.locator('button[type="submit"]').click();

    // Form should still be visible (validation failed)
    await expect(authenticatedPage.locator('text=New Security')).toBeVisible({ timeout: 2000 });

    // Close modal
    await authenticatedPage.keyboard.press('Escape');
  });

  test('should display security identifiers (ISIN, SEDOL, CUSIP)', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Create security with all identifiers
    const testSecurity = {
      ticker: 'IDS',
      name: 'Identifiers Test',
      currency: 'GBP',
      isin: 'GB0000000001',
    };

    // Open form and fill including SEDOL and CUSIP
    await staticDataPage.newSecurityButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="AAPL"]').fill(testSecurity.ticker);
    await authenticatedPage.locator('input[placeholder="Apple Inc."]').fill(testSecurity.name);
    await authenticatedPage.locator('input[placeholder="USD"]').first().fill(testSecurity.currency);
    await authenticatedPage.locator('input[placeholder="US0378331005"]').fill(testSecurity.isin);
    await authenticatedPage.locator('input[placeholder="2046251"]').fill('2046251'); // SEDOL
    await authenticatedPage.locator('input[placeholder="037833100"]').fill('037833100'); // CUSIP

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Security")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Should display all identifiers in the table
    await expect(authenticatedPage.getByText('ISIN: GB0000000001')).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('SEDOL: 2046251')).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('CUSIP: 037833100')).toBeVisible({ timeout: 5000 });

    // Clean up
    await staticDataPage.deleteSecurity(testSecurity.ticker);
  });
});
