import { test, expect } from '@playwright/test';
import { LoginPage } from '../../fixtures/pages.fixture';
import { ADMIN_USER } from '../../fixtures/auth.fixture';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(page).toHaveTitle(/Sign in|Login/i);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.login(ADMIN_USER.email, ADMIN_USER.password);

    // Wait for user menu to appear (indicates successful auth and redirect)
    await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible({ timeout: 15000 });

    // Should redirect to main app
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should show error with invalid email', async ({ page }) => {
    await loginPage.login('invalid@example.com', ADMIN_USER.password);

    // Should stay on login page
    await expect(page).toHaveURL(/login/);

    // Should show error message
    await loginPage.expectError();
  });

  test('should show error with invalid password', async ({ page }) => {
    await loginPage.login(ADMIN_USER.email, 'WrongPassword123!');

    await expect(page).toHaveURL(/login/);
    await loginPage.expectError();
  });

  test('should show error with empty fields', async () => {
    await loginPage.submitButton.click();

    // HTML5 validation should prevent submission
    const emailValidity = await loginPage.emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(emailValidity).toBe(false);
  });

  test('should navigate to registration page', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should persist login across page reload', async ({ page }) => {
    await loginPage.login(ADMIN_USER.email, ADMIN_USER.password);
    await page.waitForURL('/');

    // Reload the page and wait for app to fully initialize
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Should still be logged in - wait for user menu to appear
    await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('should work with dark mode', async ({ page }) => {
    // Enable dark mode before login
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    // Login should work in dark mode
    await loginPage.login(ADMIN_USER.email, ADMIN_USER.password);
    await expect(page).toHaveURL('/');
  });
});
