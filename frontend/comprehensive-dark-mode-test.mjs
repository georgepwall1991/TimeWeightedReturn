import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('📤 API Request:', request.method(), request.url());
      if (request.postData()) {
        console.log('   Body:', request.postData());
      }
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      console.log('📥 API Response:', response.status(), response.url());
      try {
        const body = await response.text();
        if (body) {
          console.log('   Body:', body.substring(0, 200));
        }
      } catch (e) {
        // Ignore errors reading response body
      }
    }
  });

  // Monitor console messages
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`🖥️ Browser ${type}:`, msg.text());
    }
  });

  try {
    // Navigate to login
    console.log('🌐 Navigating to login page...');
    await page.goto('http://localhost:5174/login');
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded');

    // Login
    console.log('🔐 Filling login form...');
    await page.fill('input[type="email"]', 'admin@timeweightedreturn.com');
    await page.fill('input[type="password"]', 'Admin@123');
    console.log('✅ Form filled');

    // Click submit button and wait for network activity
    console.log('🖱️ Clicking submit button...');
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login'),
      { timeout: 10000 }
    ).catch(() => null);

    await page.click('button[type="submit"]');
    console.log('✅ Button clicked, waiting for response...');

    const response = await responsePromise;

    if (response) {
      const status = response.status();
      console.log(`📋 Login response status: ${status}`);

      if (status === 200) {
        console.log('✅ Login successful!');
        // Wait for navigation
        await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 5000 });
        console.log('✅ Navigated to:', page.url());
      } else {
        console.log('❌ Login failed with status:', status);
        const body = await response.text();
        console.log('Response body:', body);
      }
    } else {
      console.log('⚠️ No response received from login API');
      const errorMessage = await page.textContent('.text-red-500, .text-red-600, .text-red-400').catch(() => null);
      if (errorMessage) {
        console.log('Error message on page:', errorMessage);
      }
    }

    await page.waitForTimeout(2000);

    // Capture main app in light mode
    console.log('📸 Capturing main app - light mode');
    await page.screenshot({ path: './screenshots/comprehensive-01-app-light.png', fullPage: true });

    // Switch to dark mode
    console.log('🌙 Switching to dark mode');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(500);

    // Capture main app in dark mode
    console.log('📸 Capturing main app - dark mode');
    await page.screenshot({ path: './screenshots/comprehensive-02-app-dark.png', fullPage: true });

    // Expand the client by clicking on the chevron
    console.log('📂 Expanding client');
    const clientChevron = await page.$('[data-type="client"] button');
    if (clientChevron) {
      await clientChevron.click();
      await page.waitForTimeout(500);
      console.log('📸 Capturing with client expanded - dark mode');
      await page.screenshot({ path: './screenshots/comprehensive-03-client-expanded-dark.png', fullPage: true });
    }

    // Click on a portfolio
    console.log('📂 Clicking portfolio');
    const portfolio = await page.$('[data-type="portfolio"]');
    if (portfolio) {
      await portfolio.click();
      await page.waitForTimeout(1500);
      console.log('📸 Capturing portfolio view - dark mode');
      await page.screenshot({ path: './screenshots/comprehensive-04-portfolio-dark.png', fullPage: true });

      // Expand portfolio to see accounts
      const portfolioChevron = await page.$('[data-type="portfolio"] button');
      if (portfolioChevron) {
        await portfolioChevron.click();
        await page.waitForTimeout(500);
        console.log('📸 Capturing with portfolio expanded - dark mode');
        await page.screenshot({ path: './screenshots/comprehensive-05-portfolio-expanded-dark.png', fullPage: true });
      }
    }

    // Click on an account
    console.log('💼 Clicking account');
    const account = await page.$('[data-type="account"]');
    if (account) {
      await account.click();
      await page.waitForTimeout(1500);
      console.log('📸 Capturing account view - dark mode');
      await page.screenshot({ path: './screenshots/comprehensive-06-account-dark.png', fullPage: true });

      // Scroll down to see more of the account details
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(500);
      console.log('📸 Capturing account details scrolled - dark mode');
      await page.screenshot({ path: './screenshots/comprehensive-07-account-scrolled-dark.png', fullPage: true });
    }

    // Try to open user menu with theme selector
    console.log('👤 Opening user menu');
    const userMenuButton = await page.$('button:has-text("System Administrator")');
    if (userMenuButton) {
      await userMenuButton.click();
      await page.waitForTimeout(500);
      console.log('📸 Capturing user menu - dark mode');
      await page.screenshot({ path: './screenshots/comprehensive-08-usermenu-dark.png', fullPage: true });

      // Close menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // Switch back to light mode for comparison
    console.log('☀️ Switching back to light mode');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    await page.waitForTimeout(500);

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    console.log('📸 Capturing final view - light mode');
    await page.screenshot({ path: './screenshots/comprehensive-09-final-light.png', fullPage: true });

    console.log('✅ Comprehensive screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
