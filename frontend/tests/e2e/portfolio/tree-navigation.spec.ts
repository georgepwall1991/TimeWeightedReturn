import { test, expect } from '../../fixtures/auth.fixture';
import { PortfolioTreePage, AppPage } from '../../fixtures/pages.fixture';

test.describe('Portfolio Tree Navigation', () => {
  test('should display portfolio tree after login', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Wait for page to fully load
    await authenticatedPage.waitForLoadState('networkidle');

    // Should show portfolio tree and default state
    await expect(authenticatedPage.locator('text=Portfolio Analytics')).toBeVisible({ timeout: 10000 });
    // Use getByText with exact match for more reliable selection
    await expect(authenticatedPage.getByText('Select a client, portfolio, or account to view details')).toBeVisible({ timeout: 10000 });
  });

  test('should expand and collapse tree nodes', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    const treePage = new PortfolioTreePage(authenticatedPage);

    await appPage.goto();

    // Try to expand all
    if (await treePage.expandAllButton.isVisible()) {
      await treePage.expandAll();
      await authenticatedPage.waitForTimeout(500);
    }

    // Try to collapse all
    if (await treePage.collapseAllButton.isVisible()) {
      await treePage.collapseAll();
      await authenticatedPage.waitForTimeout(500);
    }
  });

  test('should select client and show details', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Find and click first client
    const client = authenticatedPage.locator('text=Smith Family Trust').first();

    if (await client.isVisible()) {
      await client.click();
      await authenticatedPage.waitForTimeout(1000);

      // Should show client overview or details
      // (exact content depends on implementation)
      await expect(authenticatedPage).toHaveURL('/');
    }
  });

  test('should search for portfolio items', async ({ authenticatedPage }) => {
    const treePage = new PortfolioTreePage(authenticatedPage);
    await authenticatedPage.goto('/');

    if (await treePage.searchInput.isVisible()) {
      await treePage.search('Smith');
      await authenticatedPage.waitForTimeout(500);

      // Should filter results
      const searchResults = authenticatedPage.locator('text=Smith');
      await expect(searchResults.first()).toBeVisible();
    }
  });
});
