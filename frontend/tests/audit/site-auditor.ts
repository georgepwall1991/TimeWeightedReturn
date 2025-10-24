import { chromium, type Browser, type Page } from '@playwright/test';
import { loginViaAPI, ADMIN_USER } from '../fixtures/auth.fixture';
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
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await context.newPage();

    // Set up monitoring
    this.setupMonitoring();

    // Login
    await loginViaAPI(this.page, ADMIN_USER);

    console.log('✅ Auditor initialized and logged in');
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

    await this.page.goto('/');

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

    await this.page.goto('/');

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

    await this.page.goto('/');

    // Try clicking on various elements to check for dead ends
    const client = await this.page.locator('text=Smith Family Trust').first();

    if (await client.isVisible()) {
      await client.click();
      await this.page.waitForTimeout(1000);

      // Check if anything changed or if we're stuck
      const url = this.page.url();
      console.log(`  Clicked client, URL: ${url}`);
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

      await this.auditDarkMode();
      await this.auditAccessibility();
      await this.auditPerformance();
      await this.auditNavigation();

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
      await this.browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const auditor = new SiteAuditor();
  auditor.run();
}

export { SiteAuditor };
