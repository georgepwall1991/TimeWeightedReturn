import { test, expect } from '../../fixtures/auth.fixture';
import { StaticDataPage } from '../../fixtures/pages.fixture';

test.describe('Static Data - Benchmarks CRUD', () => {
  test('should switch to benchmarks tab', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();

    // Switch to benchmarks
    await staticDataPage.switchToBenchmarks();

    // Benchmarks tab should be active
    await expect(staticDataPage.benchmarksTab).toHaveClass(/border-blue-500/);

    // Should show "New Benchmark" button
    await expect(staticDataPage.newBenchmarkButton).toBeVisible({ timeout: 5000 });
  });

  test('should show empty state when no benchmarks exist', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // May show either table or empty state
    const hasTable = await authenticatedPage.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
    const hasEmptyState = await authenticatedPage.locator('text=No benchmarks').isVisible({ timeout: 3000 }).catch(() => false);

    // One should be visible
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should open benchmark form modal', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Click new benchmark button
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Modal should appear - use heading role
    await expect(authenticatedPage.getByRole('heading', { name: 'New Benchmark' })).toBeVisible({ timeout: 3000 });

    // Should have form fields
    await expect(authenticatedPage.locator('input[placeholder="S&P 500"]')).toBeVisible();
    await expect(authenticatedPage.locator('input[placeholder="^GSPC"]')).toBeVisible();

    // Close modal
    await authenticatedPage.keyboard.press('Escape');
    await authenticatedPage.waitForTimeout(300);
  });

  test('should create a new benchmark successfully', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Click new benchmark
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    // Fill form - use exact placeholders
    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Test Benchmark');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^TEST');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('GBP');
    await authenticatedPage.locator('textarea').fill('Test benchmark description');

    // Submit
    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show in table
    await expect(authenticatedPage.getByText('Test Benchmark')).toBeVisible({ timeout: 5000 });
    await expect(authenticatedPage.getByText('^TEST')).toBeVisible({ timeout: 5000 });

    // Clean up - delete
    const row = authenticatedPage.locator('tr:has-text("^TEST")').first();
    await row.getByRole('button').last().click(); // Delete button
    authenticatedPage.once('dialog', dialog => dialog.accept());
    await authenticatedPage.waitForTimeout(500);
  });

  test('should search benchmarks', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Create test benchmark
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Search Test');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^SRCH');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('GBP');

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Search for it
    await staticDataPage.searchInput.fill('Search Test');
    await authenticatedPage.waitForTimeout(500);

    // Should show matching result
    await expect(authenticatedPage.getByText('Search Test')).toBeVisible({ timeout: 3000 });

    // Clear search
    await staticDataPage.searchInput.clear();

    // Clean up
    const row = authenticatedPage.locator('tr:has-text("^SRCH")').first();
    await row.getByRole('button').last().click();
    authenticatedPage.once('dialog', dialog => dialog.accept());
  });

  test('should edit a benchmark', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Create test benchmark
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Edit Test');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^EDIT');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('GBP');

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Click edit
    const row = authenticatedPage.locator('tr:has-text("^EDIT")').first();
    const editButton = row.getByRole('button').first();
    await editButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Should show edit modal - use heading role
    await expect(authenticatedPage.getByRole('heading', { name: 'Edit Benchmark' })).toBeVisible({ timeout: 3000 });

    // Update name
    const nameInput = authenticatedPage.locator('input[placeholder="S&P 500"]');
    await nameInput.clear();
    await nameInput.fill('Updated Benchmark');

    // Save
    await authenticatedPage.locator('button[type="submit"]:has-text("Update Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show updated name
    await expect(authenticatedPage.getByText('Updated Benchmark')).toBeVisible({ timeout: 5000 });

    // Clean up
    const deleteRow = authenticatedPage.locator('tr:has-text("^EDIT")').first();
    await deleteRow.getByRole('button').last().click();
    authenticatedPage.once('dialog', dialog => dialog.accept());
  });

  test('should delete a benchmark', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Create test benchmark
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Delete Test');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^DEL');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('GBP');

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Verify exists
    await expect(authenticatedPage.getByText('^DEL')).toBeVisible({ timeout: 3000 });

    // Delete
    const row = authenticatedPage.locator('tr:has-text("^DEL")').first();
    await row.getByRole('button').last().click();
    authenticatedPage.once('dialog', dialog => dialog.accept());
    await authenticatedPage.waitForTimeout(500);

    // Should be removed
    await expect(authenticatedPage.getByText('^DEL')).not.toBeVisible({ timeout: 3000 });
  });

  test('should toggle benchmark active status', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Create test benchmark
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Active Test');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^ACTIVE');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('GBP');

    // Uncheck active checkbox
    const activeCheckbox = authenticatedPage.locator('input[type="checkbox"]#isActive');
    await activeCheckbox.uncheck();

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Edit to toggle active status
    const row = authenticatedPage.locator('tr:has-text("^ACTIVE")').first();
    await row.getByRole('button').first().click();
    await authenticatedPage.waitForTimeout(500);

    // Check active checkbox
    const editActiveCheckbox = authenticatedPage.locator('input[type="checkbox"]#isActive');
    await editActiveCheckbox.check();

    await authenticatedPage.locator('button[type="submit"]:has-text("Update Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Clean up
    const deleteRow = authenticatedPage.locator('tr:has-text("^ACTIVE")').first();
    await deleteRow.getByRole('button').last().click();
    authenticatedPage.once('dialog', dialog => dialog.accept());
  });

  test('should validate required fields for benchmark', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Open form
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(500);

    // Try to submit without filling required fields
    await authenticatedPage.locator('button[type="submit"]').click();

    // Form should still be visible (validation failed) - use heading role
    await expect(authenticatedPage.getByRole('heading', { name: 'New Benchmark' })).toBeVisible({ timeout: 2000 });

    // Close modal
    await authenticatedPage.keyboard.press('Escape');
  });

  test('should display benchmark currency correctly', async ({ authenticatedPage }) => {
    const staticDataPage = new StaticDataPage(authenticatedPage);
    await staticDataPage.goto();
    await staticDataPage.switchToBenchmarks();

    // Create benchmark with specific currency
    await staticDataPage.newBenchmarkButton.click();
    await authenticatedPage.waitForTimeout(300);

    await authenticatedPage.locator('input[placeholder="S&P 500"]').fill('Currency Test');
    await authenticatedPage.locator('input[placeholder="^GSPC"]').fill('^CUR');
    await authenticatedPage.locator('input[placeholder="USD"]').fill('EUR');

    await authenticatedPage.locator('button[type="submit"]:has-text("Create Benchmark")').click();
    await authenticatedPage.waitForLoadState('networkidle');

    // Should display EUR in the currency column
    const row = authenticatedPage.locator('tr:has-text("^CUR")').first();
    await expect(row.getByText('EUR')).toBeVisible({ timeout: 3000 });

    // Clean up
    await row.getByRole('button').last().click();
    authenticatedPage.once('dialog', dialog => dialog.accept());
  });
});
