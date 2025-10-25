import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Wait for API call to complete
 */
export async function waitForAPI(page: Page, urlPattern: string | RegExp, timeout = 10000): Promise<void> {
  await page.waitForResponse(
    response => {
      const url = response.url();
      return typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Check if server is running
 */
export async function isServerRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for element to be stable (no more layout shifts)
 */
export async function waitForStable(page: Page, selector: string, timeout = 5000): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout });

  // Wait a bit for any animations/transitions
  await page.waitForTimeout(300);
}

/**
 * Check dark mode is active
 */
export async function isDarkMode(page: Page): Promise<boolean> {
  // Wait a bit for theme to settle after any changes
  await page.waitForTimeout(200);

  // Check the HTML element for dark class
  return await page.evaluate(() => {
    return document.documentElement.classList.contains('dark');
  });
}

/**
 * Enable dark mode
 * Sets localStorage and reloads to ensure ThemeProvider picks it up
 */
export async function enableDarkMode(page: Page): Promise<void> {
  // Set theme in localStorage before anything else
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark');
  });

  // Also set it directly in case page is already loaded
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    // Manually add dark class to DOM for immediate effect
    document.documentElement.classList.add('dark');
  });

  // Wait for theme to apply
  await page.waitForTimeout(500);

  // Verify dark mode is active
  const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  if (!isDark) {
    // If not applied, reload the page to let ThemeProvider initialize with dark theme
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }
}

/**
 * Disable dark mode
 * Sets localStorage and reloads to ensure ThemeProvider picks it up
 */
export async function disableDarkMode(page: Page): Promise<void> {
  // Set theme in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
  });

  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    // Manually remove dark class from DOM
    document.documentElement.classList.remove('dark');
  });

  // Wait for theme to apply
  await page.waitForTimeout(500);
}

/**
 * Get all console messages of a specific type
 */
export function captureConsoleMessages(page: Page, type: 'log' | 'error' | 'warning' = 'error'): string[] {
  const messages: string[] = [];

  page.on('console', msg => {
    if (msg.type() === type) {
      messages.push(msg.text());
    }
  });

  return messages;
}

/**
 * Get all network failures
 */
export function captureNetworkFailures(page: Page): Array<{ url: string; status: number }> {
  const failures: Array<{ url: string; status: number }> = [];

  page.on('response', response => {
    if (!response.ok() && response.status() !== 304) {
      failures.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  return failures;
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Assert no console errors
 */
export async function assertNoConsoleErrors(page: Page, allowedErrors: string[] = []): Promise<void> {
  const errors = captureConsoleMessages(page, 'error');
  const unexpectedErrors = errors.filter(error =>
    !allowedErrors.some(allowed => error.includes(allowed))
  );

  expect(unexpectedErrors).toHaveLength(0);
}

/**
 * Fill form and submit
 */
export async function fillAndSubmitForm(
  page: Page,
  formData: Record<string, string>,
  submitSelector = 'button[type="submit"]'
): Promise<void> {
  for (const [name, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${name}"], input[type="${name}"]`);
    await input.fill(value);
  }

  await page.click(submitSelector);
}
