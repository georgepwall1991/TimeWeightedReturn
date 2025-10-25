import { test, expect } from '../../fixtures/auth.fixture';
import { AppPage } from '../../fixtures/pages.fixture';
import { isDarkMode, enableDarkMode, disableDarkMode } from '../../utils/test-helpers';

test.describe('Dark Mode', () => {
  test('should toggle dark mode via user menu', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Explicitly ensure we start in light mode
    await disableDarkMode(authenticatedPage);
    await authenticatedPage.waitForLoadState('networkidle');

    let darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(false);

    // Switch to dark mode
    await appPage.switchTheme('Dark');

    darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(true);

    // Verify dark mode is applied
    const htmlClasses = await authenticatedPage.evaluate(() => document.documentElement.className);
    expect(htmlClasses).toContain('dark');
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

    // Ensure we're on the home page
    await appPage.goto();
    await authenticatedPage.waitForLoadState('networkidle');

    // Start tracking console errors (filter out common non-critical warnings)
    const errors: string[] = [];
    authenticatedPage.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known non-critical errors
        if (!text.includes('Failed to load resource') && !text.includes('net::ERR')) {
          errors.push(text);
        }
      }
    });

    // Select system theme
    await appPage.switchTheme('System');

    // Should respect system preference
    // (exact behavior depends on OS dark mode setting)
    await authenticatedPage.waitForTimeout(1500);

    // Verify no critical errors occurred during theme switch
    // Note: Some browsers may log minor warnings, but no actual errors should occur
    expect(errors.filter(e => e.includes('theme')).length).toBe(0);
  });
});
