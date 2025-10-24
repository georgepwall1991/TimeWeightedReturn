import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type AuthUser = {
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
};

export const ADMIN_USER: AuthUser = {
  email: 'admin@timeweightedreturn.com',
  password: 'Admin@123',
};

/**
 * Custom fixture that provides an authenticated page
 *
 * Usage:
 *   test('should access protected route', async ({ authenticatedPage }) => {
 *     await authenticatedPage.goto('/');
 *     await expect(authenticatedPage).toHaveURL('/');
 *   });
 */
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page first
    await page.goto('/login');

    // Set theme to light mode in localStorage BEFORE login
    // This ensures theme context reads 'light' on initialization
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });

    // Login via UI
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);
    await page.click('button[type="submit"]');

    // Wait for successful login (redirected away from login page)
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });

    // Wait for user menu to be visible (indicates auth state is fully initialized)
    // This implicitly waits for AuthInitializer to fetch user data and update Redux
    await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible({ timeout: 10000 });

    // Ensure light mode is active after login and wait for it to apply
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    // Wait for theme to be removed (confirm light mode is active)
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'), { timeout: 2000 });

    // Use the authenticated page in the test
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    // Cleanup: logout after test
    // (optional - each test gets a fresh context anyway)
  },
});

/**
 * Login via API for faster test setup
 *
 * This is faster than UI-based login and can be used in beforeEach hooks
 */
export async function loginViaAPI(page: Page, user: AuthUser = ADMIN_USER): Promise<void> {
  const response = await page.request.post('http://localhost:5011/api/auth/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  expect(response.ok()).toBeTruthy();

  const tokens = await response.json();
  user.accessToken = tokens.accessToken;
  user.refreshToken = tokens.refreshToken;

  // Set tokens in localStorage
  await page.goto('/');
  await page.evaluate((tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('expiresAt', tokens.expiresAt);
  }, tokens);

  // Reload to apply authentication
  await page.reload();

  // Wait for auth to be recognized (AuthInitializer will fetch user data and populate Redux)
  await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible({ timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  await page.locator('button[aria-label*="User menu"]').click();
  await page.locator('text=Logout').click();
  await page.waitForURL('/login');
}

export { expect };
