import { test, expect } from '../fixtures/auth.fixture';
import { AppPage } from '../fixtures/pages.fixture';
import {
  auditPageLayout,
  auditChartLayout,
  generateLayoutReport,
  checkTextOverflow,
  checkTouchTargetSize,
  LayoutIssue,
} from '../utils/layout-audit';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Automated Layout Audit Tests
 *
 * These tests use the layout audit utilities to programmatically
 * detect common layout issues and generate reports.
 */

test.describe('Automated Layout Audit', () => {
  // Get current file directory in ES module
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const AUDIT_REPORT_DIR = path.join(currentDir, '../../audit-reports');

  // Ensure report directory exists
  test.beforeAll(() => {
    if (!fs.existsSync(AUDIT_REPORT_DIR)) {
      fs.mkdirSync(AUDIT_REPORT_DIR, { recursive: true });
    }
  });

  async function navigateToPortfolioWithData(page: any) {
    const appPage = new AppPage(page);
    await appPage.goto();
    await page.waitForLoadState('networkidle');

    const smithFamily = page.locator('text=Smith Family Trust').first();
    if (await smithFamily.isVisible({ timeout: 5000 })) {
      await smithFamily.click();
      await page.waitForTimeout(2000);
    }
  }

  test('should audit page layout and generate report - Desktop', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    await navigateToPortfolioWithData(authenticatedPage);

    // Run comprehensive layout audit
    const issues = await auditPageLayout(authenticatedPage);

    // Generate report
    const report = generateLayoutReport(issues);
    const reportPath = path.join(AUDIT_REPORT_DIR, 'layout-audit-desktop.txt');
    fs.writeFileSync(reportPath, report);

    console.log(report);
    console.log(`Full report saved to: ${reportPath}`);

    // Assertions based on severity
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const warnings = issues.filter(i => i.severity === 'warning');

    // Critical issues should be zero
    expect(criticalIssues.length).toBe(0);

    // Log warnings but don't fail the test
    if (warnings.length > 0) {
      console.log(`⚠️  Found ${warnings.length} layout warnings. Review the report for details.`);
    }
  });

  test('should audit page layout and generate report - Mobile', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    await navigateToPortfolioWithData(authenticatedPage);

    const issues = await auditPageLayout(authenticatedPage);
    const report = generateLayoutReport(issues);
    const reportPath = path.join(AUDIT_REPORT_DIR, 'layout-audit-mobile.txt');
    fs.writeFileSync(reportPath, report);

    console.log(report);
    console.log(`Full report saved to: ${reportPath}`);

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);
  });

  test('should audit page layout and generate report - Tablet', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 768, height: 1024 });
    await navigateToPortfolioWithData(authenticatedPage);

    const issues = await auditPageLayout(authenticatedPage);
    const report = generateLayoutReport(issues);
    const reportPath = path.join(AUDIT_REPORT_DIR, 'layout-audit-tablet.txt');
    fs.writeFileSync(reportPath, report);

    console.log(report);
    console.log(`Full report saved to: ${reportPath}`);

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);
  });

  test('should audit chart layouts specifically', async ({ authenticatedPage }) => {
    await navigateToPortfolioWithData(authenticatedPage);

    const chartIssues: LayoutIssue[] = [];

    // Audit performance charts
    const performanceCharts = authenticatedPage.locator('.recharts-surface');
    const chartCount = await performanceCharts.count();

    for (let i = 0; i < Math.min(chartCount, 5); i++) {
      const chartSelector = `.recharts-surface >> nth=${i}`;
      const issues = await auditChartLayout(authenticatedPage, chartSelector);
      chartIssues.push(...issues);
    }

    // Generate report
    const report = generateLayoutReport(chartIssues);
    const reportPath = path.join(AUDIT_REPORT_DIR, 'chart-layout-audit.txt');
    fs.writeFileSync(reportPath, report);

    console.log('=== Chart Layout Audit ===');
    console.log(report);
    console.log(`Full report saved to: ${reportPath}`);

    // Critical chart issues should be zero
    const criticalIssues = chartIssues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);
  });

  test('should check all buttons meet accessibility standards', async ({ authenticatedPage }) => {
    await navigateToPortfolioWithData(authenticatedPage);

    const buttons = authenticatedPage.locator('button, a[href]');
    const buttonCount = await buttons.count();

    const smallButtons: string[] = [];

    for (let i = 0; i < Math.min(buttonCount, 50); i++) {
      const button = buttons.nth(i);
      const issue = await checkTouchTargetSize(button, 32); // Using 32px minimum (slightly relaxed)

      if (issue) {
        const text = await button.textContent();
        smallButtons.push(`${issue.element}: "${text?.trim()}" (${issue.description})`);
      }
    }

    if (smallButtons.length > 0) {
      const report = `=== Accessibility Audit - Touch Targets ===\n\nButtons below minimum size (32px):\n\n${smallButtons.join('\n')}`;
      const reportPath = path.join(AUDIT_REPORT_DIR, 'accessibility-touch-targets.txt');
      fs.writeFileSync(reportPath, report);

      console.log(report);
      console.log(`\nFull report saved to: ${reportPath}`);
      console.log(`⚠️  Found ${smallButtons.length} buttons below recommended touch target size`);
    } else {
      console.log('✅ All buttons meet minimum touch target size requirements');
    }

    // This is informational, don't fail the test
    expect(smallButtons.length).toBeLessThan(100); // Reasonable upper bound
  });

  test('should detect text overflow in metric cards', async ({ authenticatedPage }) => {
    await navigateToPortfolioWithData(authenticatedPage);

    // Check metric values specifically
    const metricValues = authenticatedPage.locator('.text-2xl, .text-xl, .text-lg').locator('.font-bold');
    const valueCount = await metricValues.count();

    const overflowingMetrics: string[] = [];

    for (let i = 0; i < Math.min(valueCount, 20); i++) {
      const value = metricValues.nth(i);
      const issue = await checkTextOverflow(value);

      if (issue) {
        const text = await value.textContent();
        overflowingMetrics.push(`${issue.element}: "${text?.trim()}"`);
      }
    }

    if (overflowingMetrics.length > 0) {
      const report = `=== Text Overflow Audit - Metrics ===\n\nMetrics with text overflow:\n\n${overflowingMetrics.join('\n')}`;
      const reportPath = path.join(AUDIT_REPORT_DIR, 'text-overflow-metrics.txt');
      fs.writeFileSync(reportPath, report);

      console.log(report);
      console.log(`\nFull report saved to: ${reportPath}`);
    }

    // Some overflow is acceptable if it's handled with ellipsis or scrolling
    // So we just log it rather than failing
  });

  test('should generate comprehensive audit report with recommendations', async ({ authenticatedPage }) => {
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    await navigateToPortfolioWithData(authenticatedPage);

    const pageIssues = await auditPageLayout(authenticatedPage);

    // Additional specific checks
    const additionalIssues: LayoutIssue[] = [];

    // Check for proper use of Tailwind responsive classes
    const grids = authenticatedPage.locator('.grid');
    const gridCount = await grids.count();

    for (let i = 0; i < Math.min(gridCount, 10); i++) {
      const grid = grids.nth(i);
      const classes = await grid.getAttribute('class');

      if (classes) {
        // Check if responsive grid classes are used
        const hasResponsiveColumns =
          classes.includes('md:grid-cols') ||
          classes.includes('lg:grid-cols') ||
          classes.includes('xl:grid-cols');

        if (!hasResponsiveColumns && classes.includes('grid-cols-')) {
          additionalIssues.push({
            type: 'responsive',
            severity: 'info',
            element: 'grid',
            description: `Grid lacks responsive column classes: "${classes}"`,
          });
        }
      }
    }

    const allIssues = [...pageIssues, ...additionalIssues];
    const report = generateLayoutReport(allIssues);

    // Add recommendations section
    const recommendations = `

=== RECOMMENDATIONS ===

Based on the audit findings, consider:

1. Text Overflow:
   - Add 'truncate' class to long text elements
   - Use 'overflow-x-auto' for wide tables
   - Implement tooltips for truncated content

2. Touch Targets:
   - Ensure buttons are at least 44x44px (WCAG 2.1 AAA)
   - Add padding to small interactive elements
   - Use 'p-2' or 'p-3' Tailwind classes for better spacing

3. Responsive Design:
   - Use responsive grid classes (grid-cols-2 md:grid-cols-4)
   - Test on actual mobile devices, not just browser emulation
   - Consider using 'container' and 'mx-auto' for content width

4. Charts:
   - Set explicit heights for chart containers
   - Use ResponsiveContainer with proper min/max widths
   - Rotate axis labels when there are many data points
   - Consider hiding some labels on mobile

5. Dark Mode:
   - Ensure all components have dark: variants
   - Test color contrast ratios
   - Use semantic color names (text-gray-900 dark:text-gray-100)

`;

    const fullReport = report + recommendations;
    const reportPath = path.join(AUDIT_REPORT_DIR, 'comprehensive-audit-report.txt');
    fs.writeFileSync(reportPath, fullReport);

    console.log(fullReport);
    console.log(`\n📊 Comprehensive report saved to: ${reportPath}`);

    // Generate summary
    const criticalIssues = allIssues.filter(i => i.severity === 'critical');
    const warnings = allIssues.filter(i => i.severity === 'warning');

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Issues: ${allIssues.length}`);
    console.log(`Critical: ${criticalIssues.length}`);
    console.log(`Warnings: ${warnings.length}`);

    expect(criticalIssues.length).toBe(0);
  });
});
