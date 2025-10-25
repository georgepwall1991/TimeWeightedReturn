import { Page, Locator } from '@playwright/test';

/**
 * Layout Audit Utilities
 *
 * Programmatic helpers to detect common layout issues like:
 * - Text overflow
 * - Element collision/overlap
 * - Insufficient spacing
 * - Elements outside viewport
 * - Broken responsive layouts
 */

export interface LayoutIssue {
  type: 'overflow' | 'overlap' | 'spacing' | 'visibility' | 'accessibility' | 'responsive';
  severity: 'critical' | 'warning' | 'info';
  element: string;
  description: string;
  boundingBox?: any;
}

/**
 * Check if an element has text overflow
 */
export async function checkTextOverflow(locator: Locator): Promise<LayoutIssue | null> {
  try {
    if (!await locator.isVisible()) return null;

    const result = await locator.evaluate((el: HTMLElement) => {
      const isOverflowing = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
      const hasEllipsis = window.getComputedStyle(el).textOverflow === 'ellipsis';
      const hasHiddenOverflow = window.getComputedStyle(el).overflow === 'hidden';

      return {
        isOverflowing,
        hasEllipsis,
        hasHiddenOverflow,
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        textContent: el.textContent?.substring(0, 50),
        selector: el.className || el.tagName,
      };
    });

    // If overflowing but doesn't have ellipsis or hidden overflow, it's a problem
    if (result.isOverflowing && !result.hasEllipsis && !result.hasHiddenOverflow) {
      return {
        type: 'overflow',
        severity: 'warning',
        element: result.selector,
        description: `Text overflow detected: "${result.textContent}" (scrollWidth: ${result.scrollWidth}, clientWidth: ${result.clientWidth})`,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if two elements overlap unexpectedly
 */
export async function checkElementOverlap(
  element1: Locator,
  element2: Locator
): Promise<LayoutIssue | null> {
  try {
    const box1 = await element1.boundingBox();
    const box2 = await element2.boundingBox();

    if (!box1 || !box2) return null;

    const overlap = !(
      box1.x + box1.width < box2.x ||
      box2.x + box2.width < box1.x ||
      box1.y + box1.height < box2.y ||
      box2.y + box2.height < box1.y
    );

    if (overlap) {
      return {
        type: 'overlap',
        severity: 'warning',
        element: 'multiple',
        description: `Elements overlap detected`,
        boundingBox: { box1, box2 },
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if element meets minimum touch target size (WCAG 2.1)
 */
export async function checkTouchTargetSize(
  locator: Locator,
  minSize: number = 44
): Promise<LayoutIssue | null> {
  try {
    if (!await locator.isVisible()) return null;

    const box = await locator.boundingBox();
    if (!box) return null;

    if (box.width < minSize || box.height < minSize) {
      const selector = await locator.evaluate(el =>
        el.className || el.tagName
      );

      return {
        type: 'accessibility',
        severity: 'warning',
        element: selector,
        description: `Touch target too small: ${box.width}x${box.height}px (minimum recommended: ${minSize}x${minSize}px)`,
        boundingBox: box,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if element is outside viewport
 */
export async function checkViewportVisibility(
  page: Page,
  locator: Locator
): Promise<LayoutIssue | null> {
  try {
    if (!await locator.isVisible()) return null;

    const box = await locator.boundingBox();
    if (!box) return null;

    const viewport = page.viewportSize();
    if (!viewport) return null;

    const isOutside =
      box.x + box.width < 0 ||
      box.y + box.height < 0 ||
      box.x > viewport.width ||
      box.y > viewport.height;

    if (isOutside) {
      const selector = await locator.evaluate(el =>
        el.className || el.tagName
      );

      return {
        type: 'visibility',
        severity: 'critical',
        element: selector,
        description: `Element outside viewport: position (${box.x}, ${box.y}), viewport (${viewport.width}x${viewport.height})`,
        boundingBox: box,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check for insufficient spacing between elements
 */
export async function checkSpacing(
  element1: Locator,
  element2: Locator,
  minSpacing: number = 8
): Promise<LayoutIssue | null> {
  try {
    const box1 = await element1.boundingBox();
    const box2 = await element2.boundingBox();

    if (!box1 || !box2) return null;

    // Calculate distance between elements (horizontal or vertical)
    let distance = 0;

    // Check if elements are horizontally adjacent
    if (box1.y < box2.y + box2.height && box2.y < box1.y + box1.height) {
      if (box1.x < box2.x) {
        distance = box2.x - (box1.x + box1.width);
      } else {
        distance = box1.x - (box2.x + box2.width);
      }
    }
    // Check if elements are vertically adjacent
    else if (box1.x < box2.x + box2.width && box2.x < box1.x + box1.width) {
      if (box1.y < box2.y) {
        distance = box2.y - (box1.y + box1.height);
      } else {
        distance = box1.y - (box2.y + box2.height);
      }
    }

    if (distance > 0 && distance < minSpacing) {
      return {
        type: 'spacing',
        severity: 'info',
        element: 'multiple',
        description: `Insufficient spacing: ${distance}px (minimum recommended: ${minSpacing}px)`,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check responsive breakpoint behavior
 */
export async function checkResponsiveLayout(
  page: Page,
  locator: Locator,
  expectedColumns: { mobile: number; tablet: number; desktop: number }
): Promise<LayoutIssue[]> {
  const issues: LayoutIssue[] = [];

  const viewports = [
    { width: 375, height: 667, name: 'mobile', expected: expectedColumns.mobile },
    { width: 768, height: 1024, name: 'tablet', expected: expectedColumns.tablet },
    { width: 1920, height: 1080, name: 'desktop', expected: expectedColumns.desktop },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300); // Allow layout to settle

    try {
      if (!await locator.isVisible()) continue;

      const columnCount = await locator.evaluate(el => {
        const style = window.getComputedStyle(el);
        const gridCols = style.gridTemplateColumns;
        if (gridCols && gridCols !== 'none') {
          return gridCols.split(' ').length;
        }
        return 1;
      });

      if (columnCount !== viewport.expected) {
        issues.push({
          type: 'responsive',
          severity: 'warning',
          element: await locator.evaluate(el => el.className || el.tagName),
          description: `Incorrect column count on ${viewport.name}: expected ${viewport.expected}, got ${columnCount}`,
        });
      }
    } catch (error) {
      // Continue to next viewport
    }
  }

  return issues;
}

/**
 * Audit a page for common layout issues
 */
export async function auditPageLayout(page: Page): Promise<LayoutIssue[]> {
  const issues: LayoutIssue[] = [];

  // Check all interactive elements for touch target size
  const buttons = page.locator('button, a[href], input[type="button"], input[type="submit"]');
  const buttonCount = await buttons.count();

  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const issue = await checkTouchTargetSize(button);
    if (issue) issues.push(issue);
  }

  // Check all text elements for overflow
  const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, td, th');
  const textCount = await textElements.count();

  for (let i = 0; i < Math.min(textCount, 100); i++) {
    const element = textElements.nth(i);
    const issue = await checkTextOverflow(element);
    if (issue) issues.push(issue);
  }

  // Check all elements for viewport visibility
  const allVisible = page.locator(':visible');
  const visibleCount = await allVisible.count();

  for (let i = 0; i < Math.min(visibleCount, 50); i++) {
    const element = allVisible.nth(i);
    const issue = await checkViewportVisibility(page, element);
    if (issue) issues.push(issue);
  }

  return issues;
}

/**
 * Generate a report of layout issues
 */
export function generateLayoutReport(issues: LayoutIssue[]): string {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const warnings = issues.filter(i => i.severity === 'warning');
  const info = issues.filter(i => i.severity === 'info');

  let report = '=== Layout Audit Report ===\n\n';
  report += `Total Issues: ${issues.length}\n`;
  report += `Critical: ${criticalIssues.length}\n`;
  report += `Warnings: ${warnings.length}\n`;
  report += `Info: ${info.length}\n\n`;

  if (criticalIssues.length > 0) {
    report += '--- CRITICAL ISSUES ---\n';
    criticalIssues.forEach(issue => {
      report += `[${issue.type.toUpperCase()}] ${issue.element}: ${issue.description}\n`;
    });
    report += '\n';
  }

  if (warnings.length > 0) {
    report += '--- WARNINGS ---\n';
    warnings.forEach(issue => {
      report += `[${issue.type.toUpperCase()}] ${issue.element}: ${issue.description}\n`;
    });
    report += '\n';
  }

  if (info.length > 0 && info.length <= 10) {
    report += '--- INFO ---\n';
    info.forEach(issue => {
      report += `[${issue.type.toUpperCase()}] ${issue.element}: ${issue.description}\n`;
    });
  }

  return report;
}

/**
 * Check chart-specific layout issues
 */
export async function auditChartLayout(page: Page, chartSelector: string): Promise<LayoutIssue[]> {
  const issues: LayoutIssue[] = [];
  const chart = page.locator(chartSelector).first();

  if (!await chart.isVisible()) {
    issues.push({
      type: 'visibility',
      severity: 'critical',
      element: chartSelector,
      description: 'Chart is not visible',
    });
    return issues;
  }

  // Check chart dimensions
  const box = await chart.boundingBox();
  if (box) {
    if (box.width < 200 || box.height < 200) {
      issues.push({
        type: 'responsive',
        severity: 'warning',
        element: chartSelector,
        description: `Chart dimensions too small: ${box.width}x${box.height}px`,
        boundingBox: box,
      });
    }
  }

  // Check for axis label overflow
  const axisLabels = chart.locator('.recharts-xAxis text, .recharts-yAxis text');
  const labelCount = await axisLabels.count();

  for (let i = 0; i < labelCount; i++) {
    const label = axisLabels.nth(i);
    const labelBox = await label.boundingBox();
    const chartBox = await chart.boundingBox();

    if (labelBox && chartBox) {
      // Check if label extends outside chart container
      if (
        labelBox.x < chartBox.x ||
        labelBox.y < chartBox.y ||
        labelBox.x + labelBox.width > chartBox.x + chartBox.width ||
        labelBox.y + labelBox.height > chartBox.y + chartBox.height
      ) {
        issues.push({
          type: 'overflow',
          severity: 'warning',
          element: `${chartSelector} axis label`,
          description: 'Axis label extends outside chart bounds',
          boundingBox: { label: labelBox, chart: chartBox },
        });
      }
    }
  }

  // Check legend overflow
  const legend = chart.locator('.recharts-legend-wrapper');
  if (await legend.isVisible()) {
    const issue = await checkTextOverflow(legend);
    if (issue) issues.push(issue);
  }

  return issues;
}
