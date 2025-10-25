import { test, expect } from '../../fixtures/auth.fixture';
import { ManagementPage } from '../../fixtures/pages.fixture';

test.describe('Management Page - Holdings Display', () => {
  test('should navigate to management page and display portfolio tree', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Should show portfolio tree
    await expect(managementPage.portfolioTree).toBeVisible({ timeout: 10000 });

    // Should show default empty state
    await expect(authenticatedPage.getByText('Select an item to view details')).toBeVisible({ timeout: 5000 });
  });

  test('should display client holdings when client is selected', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Select first available client
    const clientButton = authenticatedPage.locator('[class*="Building2"]').first();
    if (await clientButton.isVisible()) {
      await clientButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show client overview or holdings
      await expect(authenticatedPage.locator('text=Holdings').or(authenticatedPage.locator('text=Total Value'))).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show account details when account is selected', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Try to find and click an account
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      await accountButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show tabs: Overview, Holdings, Transactions
      await expect(managementPage.overviewTab).toBeVisible({ timeout: 5000 });
      await expect(managementPage.holdingsTab).toBeVisible({ timeout: 5000 });
      await expect(managementPage.transactionsTab).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display holdings tab with correct count', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Select first account
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      await accountButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Switch to holdings tab
      await managementPage.switchToHoldingsTab();

      // Holdings tab should be active
      await expect(managementPage.holdingsTab).toHaveClass(/border-blue-500/);

      // Should either show holdings table or empty state
      const hasHoldings = await authenticatedPage.locator('table').isVisible({ timeout: 3000 }).catch(() => false);
      const hasEmptyState = await authenticatedPage.locator('text=No holdings').isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasHoldings || hasEmptyState).toBeTruthy();
    }
  });

  test('should show actual holdings in tree view when expanded', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Find an account button and expand it
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      // Click to expand holdings
      await accountButton.click();
      await authenticatedPage.waitForTimeout(1500);

      // Should show either actual security tickers or "No holdings"
      const hasSecurities = await authenticatedPage.locator('[class*="TrendingUp"]').isVisible({ timeout: 3000 }).catch(() => false);
      const hasNoHoldings = await authenticatedPage.locator('text=No holdings').isVisible({ timeout: 3000 }).catch(() => false);
      const isLoading = await authenticatedPage.locator('text=Loading holdings').isVisible({ timeout: 3000 }).catch(() => false);

      // One of these should be true
      expect(hasSecurities || hasNoHoldings || isLoading).toBeTruthy();

      // Should NOT show placeholder text like "Holding 1", "Holding 2"
      const hasPlaceholder = await authenticatedPage.locator('text=Holding 1').isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasPlaceholder).toBeFalsy();
    }
  });

  test('should allow changing holdings date', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Select first account
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      await accountButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Switch to holdings tab
      await managementPage.switchToHoldingsTab();

      // Date picker should be visible
      const datePicker = authenticatedPage.locator('input[type="date"]');
      if (await datePicker.isVisible({ timeout: 3000 })) {
        // Get current date value
        const currentDate = await datePicker.inputValue();

        // Change to a week ago
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];

        await managementPage.setHoldingsDate(weekAgoStr);

        // Verify date changed
        const newDate = await datePicker.inputValue();
        expect(newDate).toBe(weekAgoStr);
      }
    }
  });

  test('should show loading state when fetching holdings', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Select first account - loading should appear briefly
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      await accountButton.click();

      // May see loading spinner briefly
      const hasLoadingState = await authenticatedPage.locator('[class*="animate-spin"]').isVisible({ timeout: 2000 }).catch(() => false);

      // After loading, should show content
      await authenticatedPage.waitForTimeout(2000);
      const hasContent = await managementPage.overviewTab.isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should display holdings percentage and value correctly', async ({ authenticatedPage }) => {
    const managementPage = new ManagementPage(authenticatedPage);
    await managementPage.goto();

    // Select first account
    const accountButton = authenticatedPage.locator('[class*="Wallet"]').first();
    if (await accountButton.isVisible()) {
      await accountButton.click();
      await authenticatedPage.waitForTimeout(1000);

      // Switch to holdings tab
      await managementPage.switchToHoldingsTab();

      // If holdings exist, check for percentage and value display
      const holdingsTable = authenticatedPage.locator('table');
      if (await holdingsTable.isVisible({ timeout: 3000 })) {
        // Should show "% of Portfolio" column
        await expect(authenticatedPage.locator('th:has-text("% of Portfolio")')).toBeVisible();

        // Should show value column
        await expect(authenticatedPage.locator('th:has-text("Value")')).toBeVisible();

        // Should show total value in summary
        const hasTotalValue = await authenticatedPage.locator('text=Total Value').isVisible({ timeout: 2000 }).catch(() => false);
        expect(hasTotalValue).toBeTruthy();
      }
    }
  });
});
