import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';

async function captureScreenshots() {
  // Create screenshots directory
  await mkdir('./screenshots', { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');

    console.log('📸 Capturing login page - light mode');
    await page.screenshot({ path: './screenshots/01-login-light.png', fullPage: true });

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    console.log('📸 Capturing login page - dark mode');
    await page.screenshot({ path: './screenshots/02-login-dark.png', fullPage: true });

    // Log in (using admin credentials)
    console.log('🔐 Attempting login...');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });

    await page.fill('input[type="email"]', 'admin@timeweightedreturn.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('http://localhost:5174/**', { timeout: 10000 }).catch(() => {
      console.log('⚠️  Login may have failed or taken too long');
    });

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('📸 Capturing main app - light mode');
    await page.screenshot({ path: './screenshots/03-app-light.png', fullPage: true });

    // Switch to dark mode in app
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    console.log('📸 Capturing main app - dark mode');
    await page.screenshot({ path: './screenshots/04-app-dark.png', fullPage: true });

    // Try to open user menu if visible
    try {
      await page.click('button:has-text("Logout")', { timeout: 2000 }).catch(() => {});
      const userMenuButton = await page.locator('[class*="UserMenu"]').first();
      if (await userMenuButton.isVisible()) {
        await userMenuButton.click();
        await page.waitForTimeout(500);

        console.log('📸 Capturing user menu - dark mode');
        await page.screenshot({ path: './screenshots/05-menu-dark.png', fullPage: true });
      }
    } catch (e) {
      console.log('⚠️  Could not capture user menu');
    }

    console.log('✅ Screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
