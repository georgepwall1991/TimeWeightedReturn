import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'admin@timeweightedreturn.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    console.log('✅ Logged in successfully');

    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    let screenshotCounter = 1;
    const screenshot = async (name) => {
      const filename = `./screenshots/audit-${String(screenshotCounter).padStart(2, '0')}-${name}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      console.log(`📸 ${filename}`);
      screenshotCounter++;
    };

    // 1. Main dashboard (no selection)
    console.log('\n📊 Testing: Main Dashboard');
    await page.waitForTimeout(1000);
    await screenshot('main-dashboard-dark');

    // 2. Expand client tree
    console.log('\n🌳 Testing: Portfolio Tree');
    const clientChevron = await page.$('[data-type="client"] button');
    if (clientChevron) {
      await clientChevron.click();
      await page.waitForTimeout(500);
      await screenshot('tree-client-expanded-dark');
    }

    // 3. Click on portfolio
    console.log('\n📂 Testing: Portfolio View');
    const portfolio = await page.$('[data-type="portfolio"]');
    if (portfolio) {
      await portfolio.click();
      await page.waitForTimeout(1500);
      await screenshot('portfolio-overview-dark');

      // Scroll to see all content
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(300);
      await screenshot('portfolio-overview-scrolled-dark');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 4. Expand portfolio to show accounts
    const portfolioChevron = await page.$('[data-type="portfolio"] button');
    if (portfolioChevron) {
      await portfolioChevron.click();
      await page.waitForTimeout(500);
    }

    // 5. Click on account
    console.log('\n💼 Testing: Account View');
    const account = await page.$('[data-type="account"]');
    if (account) {
      await account.click();
      await page.waitForTimeout(2000);
      await screenshot('account-overview-dark');

      // Scroll to see all tabs and content
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      await screenshot('account-overview-scrolled-dark');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 6. Test Holdings tab
    console.log('\n📋 Testing: Holdings Tab');
    const holdingsTab = await page.$('button:has-text("Holdings")');
    if (holdingsTab) {
      await holdingsTab.click();
      await page.waitForTimeout(1500);
      await screenshot('account-holdings-dark');
    }

    // 7. Test Analytics tab
    console.log('\n📈 Testing: Analytics Tab');
    const analyticsTab = await page.$('button:has-text("Analytics")');
    if (analyticsTab) {
      await analyticsTab.click();
      await page.waitForTimeout(1500);
      await screenshot('account-analytics-dark');

      // Scroll to see more analytics
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);
      await screenshot('account-analytics-scrolled-dark');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 8. Test Benchmarks tab if available
    console.log('\n🎯 Testing: Benchmarks Tab');
    const benchmarksTab = await page.$('button:has-text("Benchmarks")');
    if (benchmarksTab) {
      await benchmarksTab.click();
      await page.waitForTimeout(1500);
      await screenshot('account-benchmarks-dark');
    }

    // 9. Test Client View
    console.log('\n👥 Testing: Client View');
    const client = await page.$('[data-type="client"]');
    if (client) {
      await client.click();
      await page.waitForTimeout(2000);
      await screenshot('client-overview-dark');

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      await screenshot('client-overview-scrolled-dark');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 10. Test Client Analytics
    console.log('\n📊 Testing: Client Analytics');
    const clientAnalyticsTab = await page.$('button:has-text("Analytics")');
    if (clientAnalyticsTab) {
      await clientAnalyticsTab.click();
      await page.waitForTimeout(1500);
      await screenshot('client-analytics-dark');

      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);
      await screenshot('client-analytics-scrolled-dark');
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    // 11. Test Attribution Analysis if available
    console.log('\n🔍 Testing: Attribution Analysis');
    const attributionTab = await page.$('button:has-text("Attribution")');
    if (attributionTab) {
      await attributionTab.click();
      await page.waitForTimeout(1500);
      await screenshot('attribution-analysis-dark');

      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(300);
      await screenshot('attribution-analysis-scrolled-dark');
    }

    // 12. Test User Menu and Theme Selector
    console.log('\n👤 Testing: User Menu');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const userMenuButton = await page.$('button:has-text("System Administrator")');
    if (userMenuButton) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
      await screenshot('user-menu-theme-selector-dark');
      await page.keyboard.press('Escape');
    }

    // 13. Switch to light mode for comparison
    console.log('\n☀️ Switching to Light Mode for comparison...');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await page.waitForTimeout(500);

    // Go back to no selection view
    await page.evaluate(() => window.scrollTo(0, 0));
    const logo = await page.$('a[href="/"]');
    if (logo) {
      await logo.click();
      await page.waitForTimeout(1000);
    }
    await screenshot('main-dashboard-light');

    // Click on account again
    const accountLight = await page.$('[data-type="account"]');
    if (accountLight) {
      await accountLight.click();
      await page.waitForTimeout(1500);
      await screenshot('account-overview-light');
    }

    const analyticsTabLight = await page.$('button:has-text("Analytics")');
    if (analyticsTabLight) {
      await analyticsTabLight.click();
      await page.waitForTimeout(1500);
      await screenshot('account-analytics-light');
    }

    console.log('\n✅ Dark mode audit complete!');
    console.log('\nPlease review the screenshots in ./screenshots/ folder');
    console.log('Look for:');
    console.log('  ❌ White boxes or cards that should be dark');
    console.log('  ❌ Dark text on dark backgrounds (poor contrast)');
    console.log('  ❌ Light borders on light backgrounds');
    console.log('  ❌ Inconsistent styling between components');
    console.log('  ❌ Missing hover states or focus indicators');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: './screenshots/audit-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
