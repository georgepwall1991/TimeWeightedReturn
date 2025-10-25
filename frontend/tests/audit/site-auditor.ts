import { chromium, type Browser, type Page, expect } from '@playwright/test';
import { ADMIN_USER } from '../fixtures/auth.fixture';
import * as fs from 'fs';
import * as path from 'path';

interface AuditIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'bug' | 'visual' | 'accessibility' | 'performance' | 'ux' | 'feature';
  title: string;
  description: string;
  location: string;
  screenshot?: string;
  recommendation: string;
}

class SiteAuditor {
  private browser!: Browser;
  private page!: Page;
  private issues: AuditIssue[] = [];
  private consoleErrors: string[] = [];
  private networkFailures: Array<{ url: string; status: number }> = [];

  async initialize() {
    this.browser = await chromium.launch({ headless: false });
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await context.newPage();

    // Set up monitoring
    this.setupMonitoring();

    // Try to login, but don't fail if it doesn't work
    try {
      await this.loginViaUI();
      console.log('✅ Auditor initialized and logged in');
    } catch (error) {
      console.log('⚠️  Login failed, continuing with audit anyway');
      console.log('   Some features may not be accessible');
      // Just navigate to home page
      await this.page.goto('http://localhost:5173/');
    }
  }

  private async loginViaUI() {
    console.log('  Navigating to login page...');
    await this.page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });

    // Set theme to light mode
    await this.page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });

    console.log('  Filling login form...');
    // Wait for form to be ready
    await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });

    // Fill login form
    await this.page.fill('input[type="email"]', ADMIN_USER.email);
    await this.page.fill('input[type="password"]', ADMIN_USER.password);

    console.log('  Submitting login form...');
    await this.page.click('button[type="submit"]');

    // Wait for successful login with longer timeout
    console.log('  Waiting for redirect...');
    try {
      await this.page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 20000 });
      console.log('  Login successful, current URL:', this.page.url());
    } catch (error) {
      console.log('  Login redirect timeout, current URL:', this.page.url());
      // Check for error messages
      const errorText = await this.page.textContent('body');
      console.log('  Page content sample:', errorText?.substring(0, 200));
      throw error;
    }

    // Wait for user menu or just wait for page to stabilize
    await this.page.waitForTimeout(2000);
  }

  private setupMonitoring() {
    // Capture console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });

    // Capture network failures
    this.page.on('response', response => {
      if (!response.ok() && response.status() !== 304 && response.status() !== 401) {
        this.networkFailures.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Capture JavaScript errors
    this.page.on('pageerror', error => {
      this.addIssue({
        severity: 'critical',
        category: 'bug',
        title: 'JavaScript Runtime Error',
        description: error.message,
        location: 'Global',
        recommendation: 'Fix the JavaScript error to prevent application crashes',
      });
    });
  }

  private addIssue(issue: AuditIssue) {
    this.issues.push(issue);
  }

  async auditDarkMode() {
    console.log('\n🌙 Auditing dark mode...');

    await this.page.goto('http://localhost:5173/');

    // Switch to dark mode
    await this.page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await this.page.waitForTimeout(500);

    // Check for white backgrounds that should be dark
    const whiteElements = await this.page.$$eval('*', elements => {
      return elements
        .filter(el => {
          const style = window.getComputedStyle(el);
          const bg = style.backgroundColor;
          return bg === 'rgb(255, 255, 255)' || bg === '#ffffff';
        })
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          text: el.textContent?.substring(0, 50),
        }))
        .slice(0, 10); // Limit to first 10
    });

    if (whiteElements.length > 0) {
      this.addIssue({
        severity: 'medium',
        category: 'visual',
        title: 'White Elements in Dark Mode',
        description: `Found ${whiteElements.length} elements with white backgrounds in dark mode`,
        location: 'Various locations',
        screenshot: await this.takeScreenshot('dark-mode-white-elements'),
        recommendation: 'Add dark:bg-gray-800 or similar classes to these elements',
      });
    }

    // Check for dark text on dark backgrounds
    const lowContrastElements = await this.page.$$eval('*', elements => {
      return elements
        .filter(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bg = style.backgroundColor;

          // Check if both are dark
          const isDarkText = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) && parseInt(RegExp.$1) < 100;
          const isDarkBg = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) && parseInt(RegExp.$1) < 100;

          return isDarkText && isDarkBg && el.textContent && el.textContent.trim().length > 0;
        })
        .slice(0, 5);
    });

    if (lowContrastElements.length > 0) {
      this.addIssue({
        severity: 'high',
        category: 'accessibility',
        title: 'Low Contrast in Dark Mode',
        description: `Found ${lowContrastElements.length} elements with poor contrast (dark text on dark background)`,
        location: 'Various locations',
        screenshot: await this.takeScreenshot('dark-mode-low-contrast'),
        recommendation: 'Use dark:text-gray-100 or similar light text colors in dark mode',
      });
    }
  }

  async auditAccessibility() {
    console.log('\n♿ Auditing accessibility...');

    await this.page.goto('http://localhost:5173/');

    // Check for missing alt text
    const imagesWithoutAlt = await this.page.$$eval('img', images => {
      return images.filter(img => !img.alt || img.alt.trim() === '').length;
    });

    if (imagesWithoutAlt > 0) {
      this.addIssue({
        severity: 'medium',
        category: 'accessibility',
        title: 'Images Missing Alt Text',
        description: `Found ${imagesWithoutAlt} images without alt attributes`,
        location: 'Various pages',
        recommendation: 'Add descriptive alt text to all images for screen readers',
      });
    }

    // Check for buttons without aria-label
    const buttonsWithoutLabel = await this.page.$$eval('button', buttons => {
      return buttons.filter(btn => {
        return !btn.textContent?.trim() && !btn.getAttribute('aria-label');
      }).length;
    });

    if (buttonsWithoutLabel > 0) {
      this.addIssue({
        severity: 'high',
        category: 'accessibility',
        title: 'Buttons Without Labels',
        description: `Found ${buttonsWithoutLabel} buttons without visible text or aria-label`,
        location: 'Various locations',
        recommendation: 'Add aria-label to icon-only buttons',
      });
    }
  }

  async auditPerformance() {
    console.log('\n⚡ Auditing performance...');

    const metrics = await this.page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        domInteractive: perf.domInteractive - perf.fetchStart,
      };
    });

    if (metrics.domContentLoaded > 3000) {
      this.addIssue({
        severity: 'medium',
        category: 'performance',
        title: 'Slow DOM Content Loaded',
        description: `DOM Content Loaded took ${metrics.domContentLoaded}ms (>3s)`,
        location: 'All pages',
        recommendation: 'Optimize bundle size and reduce blocking scripts',
      });
    }
  }

  async auditNavigation() {
    console.log('\n🧭 Auditing navigation...');

    await this.page.goto('http://localhost:5173/');

    // Get all navigation links
    const links = await this.page.$$eval('a[href]', anchors =>
      anchors.map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent?.trim(),
      }))
    );

    console.log(`  Found ${links.length} navigation links`);

    // Test main routes
    const routes = [
      'http://localhost:5173/',
      'http://localhost:5173/dashboard',
      'http://localhost:5173/portfolios',
      'http://localhost:5173/reports',
      'http://localhost:5173/settings'
    ];

    for (const route of routes) {
      try {
        const response = await this.page.goto(route, { waitUntil: 'domcontentloaded', timeout: 10000 });

        if (!response || !response.ok()) {
          this.addIssue({
            severity: 'critical',
            category: 'bug',
            title: `Route ${route} Failed to Load`,
            description: `Navigation to ${route} returned status ${response?.status() || 'timeout'}`,
            location: route,
            recommendation: 'Fix routing or ensure route exists',
          });
        }
      } catch (error) {
        this.addIssue({
          severity: 'high',
          category: 'bug',
          title: `Route ${route} Navigation Error`,
          description: `Error navigating to ${route}: ${error}`,
          location: route,
          recommendation: 'Investigate navigation error and fix routing',
        });
      }
    }

    // Try clicking on various elements to check for dead ends
    await this.page.goto('http://localhost:5173/');
    const client = await this.page.locator('text=Smith Family Trust').first();

    if (await client.isVisible()) {
      await client.click();
      await this.page.waitForTimeout(1000);

      // Check if anything changed or if we're stuck
      const url = this.page.url();
      console.log(`  Clicked client, URL: ${url}`);
    }
  }

  async auditKeyboardNavigation() {
    console.log('\n⌨️ Auditing keyboard navigation...');

    await this.page.goto('http://localhost:5173/');

    // Check if tab navigation works
    let focusableElements = 0;
    try {
      // Press Tab several times and count focusable elements
      for (let i = 0; i < 20; i++) {
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(100);

        const focused = await this.page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName || null;
        });

        if (focused && focused !== 'BODY') {
          focusableElements++;
        }
      }

      console.log(`  Found ${focusableElements} focusable elements`);

      if (focusableElements < 5) {
        this.addIssue({
          severity: 'high',
          category: 'accessibility',
          title: 'Limited Keyboard Navigation',
          description: `Only ${focusableElements} elements were focusable via keyboard`,
          location: 'Homepage',
          recommendation: 'Ensure all interactive elements are keyboard accessible',
        });
      }
    } catch (error) {
      console.log(`  Keyboard navigation test error: ${error}`);
    }
  }

  async auditForms() {
    console.log('\n📝 Auditing forms...');

    await this.page.goto('http://localhost:5173/');

    // Check for forms without labels
    const formsWithoutLabels = await this.page.$$eval('input, select, textarea', inputs => {
      return inputs.filter(input => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);

        return !hasLabel && !ariaLabel && input.type !== 'hidden';
      }).length;
    });

    if (formsWithoutLabels > 0) {
      this.addIssue({
        severity: 'medium',
        category: 'accessibility',
        title: 'Form Inputs Missing Labels',
        description: `Found ${formsWithoutLabels} form inputs without associated labels`,
        location: 'Various forms',
        recommendation: 'Add <label> elements or aria-label attributes to all form inputs',
      });
    }
  }

  async auditMobileViewport() {
    console.log('\n📱 Auditing mobile viewport...');

    // Set mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.goto('http://localhost:5173/');
    await this.page.waitForTimeout(1000);

    // Check for horizontal scrolling
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      this.addIssue({
        severity: 'medium',
        category: 'visual',
        title: 'Horizontal Scroll on Mobile',
        description: 'Page content extends beyond viewport width on mobile',
        location: 'Mobile viewport (375x667)',
        screenshot: await this.takeScreenshot('mobile-horizontal-scroll'),
        recommendation: 'Fix responsive design to prevent horizontal scrolling',
      });
    }

    // Check font sizes
    const smallText = await this.page.$$eval('*', elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        return fontSize < 12 && el.textContent && el.textContent.trim().length > 0;
      }).length;
    });

    if (smallText > 5) {
      this.addIssue({
        severity: 'low',
        category: 'ux',
        title: 'Small Text on Mobile',
        description: `Found ${smallText} elements with font size below 12px on mobile`,
        location: 'Mobile viewport',
        recommendation: 'Increase font size for better mobile readability',
      });
    }

    // Reset viewport
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async auditLoadingStates() {
    console.log('\n⏳ Auditing loading states...');

    await this.page.goto('http://localhost:5173/');

    // Check if there are loading indicators
    const hasLoadingIndicators = await this.page.$$eval('[role="status"], .loading, .spinner', els => els.length > 0);

    console.log(`  Loading indicators present: ${hasLoadingIndicators}`);
  }

  async auditCRUDOperations() {
    console.log('\n🔧 Auditing CRUD operations...');

    // Navigate to portfolios or clients page
    try {
      await this.page.goto('http://localhost:5173/portfolios');
      await this.page.waitForTimeout(1000);

      // Look for create/add buttons
      const hasCreateButton = await this.page.$$eval('button', buttons => {
        return buttons.some(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('add') || text.includes('create') || text.includes('new');
        });
      });

      console.log(`  Create button found: ${hasCreateButton}`);

      if (!hasCreateButton) {
        this.addIssue({
          severity: 'medium',
          category: 'feature',
          title: 'Missing Create Button',
          description: 'No visible "Add" or "Create" button found on portfolios page',
          location: '/portfolios',
          recommendation: 'Add a create/add button for better UX',
        });
      }
    } catch (error) {
      console.log(`  CRUD audit error: ${error}`);
    }
  }

  private async takeScreenshot(name: string): Promise<string> {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join('audit-reports', 'screenshots', filename);

    // Ensure directory exists
    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    await this.page.screenshot({ path: filepath, fullPage: true });
    return filename;
  }

  async generateReport() {
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join('audit-reports', `site-examination-${timestamp}.md`);

    const issuesBySeverity = {
      critical: this.issues.filter(i => i.severity === 'critical'),
      high: this.issues.filter(i => i.severity === 'high'),
      medium: this.issues.filter(i => i.severity === 'medium'),
      low: this.issues.filter(i => i.severity === 'low'),
    };

    let report = `# Site Examination Report\n\n`;
    report += `**Date:** ${new Date().toLocaleString()}\n\n`;

    report += `## Executive Summary\n\n`;
    report += `- **Critical Issues:** ${issuesBySeverity.critical.length}\n`;
    report += `- **High Priority:** ${issuesBySeverity.high.length}\n`;
    report += `- **Medium Priority:** ${issuesBySeverity.medium.length}\n`;
    report += `- **Low Priority:** ${issuesBySeverity.low.length}\n`;
    report += `- **Total Issues:** ${this.issues.length}\n\n`;

    if (this.consoleErrors.length > 0) {
      report += `### Console Errors\n\n`;
      report += `Found ${this.consoleErrors.length} console errors:\n\n`;
      this.consoleErrors.slice(0, 10).forEach(error => {
        report += `- \`${error}\`\n`;
      });
      report += `\n`;
    }

    if (this.networkFailures.length > 0) {
      report += `### Network Failures\n\n`;
      this.networkFailures.forEach(failure => {
        report += `- **${failure.status}**: ${failure.url}\n`;
      });
      report += `\n`;
    }

    // Add issues by severity
    for (const [severity, issues] of Object.entries(issuesBySeverity)) {
      if (issues.length > 0) {
        report += `## ${severity.toUpperCase()} Issues\n\n`;

        issues.forEach((issue, index) => {
          report += `### ${index + 1}. ${issue.title}\n\n`;
          report += `- **Category:** ${issue.category}\n`;
          report += `- **Location:** ${issue.location}\n`;
          report += `- **Description:** ${issue.description}\n`;
          if (issue.screenshot) {
            report += `- **Screenshot:** ![Screenshot](screenshots/${issue.screenshot})\n`;
          }
          report += `- **Recommendation:** ${issue.recommendation}\n\n`;
        });
      }
    }

    fs.writeFileSync(reportPath, report);

    console.log(`\n✅ Report generated: ${reportPath}`);
    return reportPath;
  }

  async run() {
    try {
      await this.initialize();

      // Run all audit checks
      await this.auditDarkMode();
      await this.auditAccessibility();
      await this.auditPerformance();
      await this.auditNavigation();
      await this.auditKeyboardNavigation();
      await this.auditForms();
      await this.auditMobileViewport();
      await this.auditLoadingStates();
      await this.auditCRUDOperations();

      const reportPath = await this.generateReport();

      console.log(`\n📊 Audit Summary:`);
      console.log(`   Critical: ${this.issues.filter(i => i.severity === 'critical').length}`);
      console.log(`   High:     ${this.issues.filter(i => i.severity === 'high').length}`);
      console.log(`   Medium:   ${this.issues.filter(i => i.severity === 'medium').length}`);
      console.log(`   Low:      ${this.issues.filter(i => i.severity === 'low').length}`);
      console.log(`\n📄 Full report: ${reportPath}`);

    } catch (error) {
      console.error('❌ Audit failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

export { SiteAuditor };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new SiteAuditor();
  auditor.run();
}
