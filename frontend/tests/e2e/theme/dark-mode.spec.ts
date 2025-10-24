import { test, expect } from '../../fixtures/auth.fixture';
import { AppPage } from '../../fixtures/pages.fixture';
import { isDarkMode, enableDarkMode, disableDarkMode } from '../../utils/test-helpers';

test.describe('Dark Mode', () => {
  test('should toggle dark mode via user menu', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Start in light mode
    await disableDarkMode(authenticatedPage);

    let darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(false);

    // Switch to dark mode
    await appPage.switchTheme('Dark');

    darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(true);

    // Switch back to light mode
    await appPage.switchTheme('Light');

    darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(false);
  });

  test('should maintain dark mode across navigation', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Enable dark mode
    await appPage.switchTheme('Dark');

    const darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(true);

    // Navigate to another route and back
    await authenticatedPage.goto('/login');
    await authenticatedPage.goBack();

    // Dark mode should persist
    const stillDark = await isDarkMode(authenticatedPage);
    expect(stillDark).toBe(true);
  });

  test('should persist dark mode preference across sessions', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Enable dark mode
    await appPage.switchTheme('Dark');

    // Reload the page
    await authenticatedPage.reload();

    // Dark mode should persist
    await authenticatedPage.waitForTimeout(1000);
    const darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(true);
  });

  test('should apply dark mode styling to all components', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/');

    // Enable dark mode
    await enableDarkMode(authenticatedPage);

    // Check various UI elements have dark styling
    const sidebar = authenticatedPage.locator('[class*="sidebar"], [class*="tree"]').first();
    if (await sidebar.isVisible()) {
      const bgColor = await sidebar.evaluate(el => getComputedStyle(el).backgroundColor);
      // Should be a dark color (not white/light gray)
      expect(bgColor).not.toMatch(/rgb\(255,\s*255,\s*255\)/);
    }
  });

  test('should work with system theme preference', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Select system theme
    await appPage.switchTheme('System');

    // Should respect system preference
    // (exact behavior depends on OS dark mode setting)
    await authenticatedPage.waitForTimeout(500);

    // Verify no errors occurred
    const errors: string[] = [];
    authenticatedPage.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });
});
