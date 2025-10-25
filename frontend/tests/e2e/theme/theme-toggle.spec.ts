import { test, expect } from '../../fixtures/auth.fixture';
import { AppPage } from '../../fixtures/pages.fixture';
import { isDarkMode, disableDarkMode } from '../../utils/test-helpers';

test.describe('Theme Toggle', () => {
  test('should switch from light to dark mode', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Ensure light mode
    await disableDarkMode(authenticatedPage);
    await authenticatedPage.waitForLoadState('networkidle');

    // Verify starting in light mode
    let darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(false);

    // Switch to dark mode
    await appPage.switchTheme('Dark');

    // Verify dark mode is active
    darkModeActive = await isDarkMode(authenticatedPage);
    expect(darkModeActive).toBe(true);
  });

  test('should toggle system theme preference', async ({ authenticatedPage }) => {
    const appPage = new AppPage(authenticatedPage);
    await appPage.goto();

    // Ensure light mode first
    await disableDarkMode(authenticatedPage);
    await authenticatedPage.waitForLoadState('networkidle');

    // Track console errors
    const errors: string[] = [];
    authenticatedPage.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Switch to system theme
    await appPage.switchTheme('System');

    // Wait for theme to apply
    await authenticatedPage.waitForTimeout(1000);

    // Verify no errors occurred during theme switch
    expect(errors.length).toBe(0);
  });
});
