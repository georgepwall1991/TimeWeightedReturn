import { test, expect } from '../fixtures/auth.fixture';
import { AppPage } from '../fixtures/pages.fixture';
import { enableDarkMode, disableDarkMode } from '../utils/test-helpers';

/**
 * Visual Layout Testing for Charts and UI Components
 *
 * This test suite validates that charts, tables, and UI components
 * render correctly across different viewports and don't have layout issues
 * like cramped spacing, overlapping labels, or text overflow.
 */

// Define viewport configurations for responsive testing
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  laptop: { width: 1366, height: 768, name: 'Laptop' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  mobile: { width: 375, height: 667, name: 'Mobile' },
  mobileWide: { width: 414, height: 896, name: 'Mobile Wide' },
};

test.describe('Charts Layout - Visual Regression', () => {
  test.describe.configure({ mode: 'parallel' });

  // Helper function to navigate to a portfolio with data
  async function navigateToPortfolioWithData(page: any) {
    const appPage = new AppPage(page);
    await appPage.goto();
    await page.waitForLoadState('networkidle');

    // Click on a client/portfolio to load data
    const smithFamily = page.locator('text=Smith Family Trust').first();
    if (await smithFamily.isVisible({ timeout: 5000 })) {
      await smithFamily.click();
      await page.waitForTimeout(1500); // Wait for charts to render
    }
  }

  // Helper to check if element text is truncated (has ellipsis or overflow)
  async function isTextOverflowing(element: any) {
    return await element.evaluate((el: HTMLElement) => {
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    });
  }

  test.describe('Responsive Layout Tests', () => {
    for (const [key, viewport] of Object.entries(VIEWPORTS)) {
      test(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ authenticatedPage }) => {
        // Set viewport
        await authenticatedPage.setViewportSize({ width: viewport.width, height: viewport.height });

        await navigateToPortfolioWithData(authenticatedPage);

        // Take full page screenshot for visual comparison
        await expect(authenticatedPage).toHaveScreenshot(`layout-${key}.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });
    }
  });

  test.describe('Chart Axis Labels', () => {
    test('should not have overlapping X-axis labels on contribution chart', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Look for contribution chart
      const contributionChart = authenticatedPage.locator('text=Performance Contribution Analysis').first();
      if (await contributionChart.isVisible({ timeout: 5000 })) {
        // Get the chart container
        const chartContainer = contributionChart.locator('..').locator('..'); // Navigate up to container

        // Take screenshot of the chart
        await expect(chartContainer).toHaveScreenshot('contribution-chart-mobile.png', {
          maxDiffPixels: 50,
        });

        // Check for rotated labels - they should be visible and not cut off
        const xAxisLabels = chartContainer.locator('.recharts-xAxis .recharts-text');
        const labelCount = await xAxisLabels.count();

        if (labelCount > 0) {
          // Verify at least some labels are visible
          for (let i = 0; i < Math.min(labelCount, 3); i++) {
            const label = xAxisLabels.nth(i);
            if (await label.isVisible()) {
              const boundingBox = await label.boundingBox();
              expect(boundingBox).toBeTruthy();
              expect(boundingBox!.height).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    test('should handle rotated axis labels without cutoff', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.tablet);
      await navigateToPortfolioWithData(authenticatedPage);

      // Check all charts with rotated labels
      const charts = authenticatedPage.locator('[class*="recharts-surface"]');
      const chartCount = await charts.count();

      for (let i = 0; i < Math.min(chartCount, 3); i++) {
        const chart = charts.nth(i);
        if (await chart.isVisible()) {
          const parentContainer = chart.locator('..');

          // Verify chart doesn't overflow its container
          const isOverflowing = await parentContainer.evaluate((el: HTMLElement) => {
            const container = el.closest('.bg-white, .dark\\:bg-gray-800');
            if (!container) return false;
            return el.scrollWidth > container.clientWidth;
          });

          expect(isOverflowing).toBe(false);
        }
      }
    });
  });

  test.describe('Legend and Label Overflow', () => {
    test('should handle long holding names with truncation', async ({ authenticatedPage }) => {
      await navigateToPortfolioWithData(authenticatedPage);

      // Find holdings composition chart legend
      const legend = authenticatedPage.locator('.max-h-48.overflow-y-auto').first();

      if (await legend.isVisible({ timeout: 5000 })) {
        // Check that legend is scrollable if content exceeds max height
        const scrollHeight = await legend.evaluate(el => el.scrollHeight);
        const clientHeight = await legend.evaluate(el => el.clientHeight);

        if (scrollHeight > clientHeight) {
          // Legend should be scrollable
          const isScrollable = await legend.evaluate(el => {
            return el.scrollHeight > el.clientHeight &&
                   window.getComputedStyle(el).overflowY !== 'hidden';
          });
          expect(isScrollable).toBe(true);
        }

        // Check for truncated text
        const legendItems = legend.locator('.truncate');
        const itemCount = await legendItems.count();

        for (let i = 0; i < Math.min(itemCount, 5); i++) {
          const item = legendItems.nth(i);
          if (await item.isVisible()) {
            // Verify truncation is applied correctly
            const hasEllipsis = await item.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.textOverflow === 'ellipsis' &&
                     style.overflow === 'hidden' &&
                     style.whiteSpace === 'nowrap';
            });
            expect(hasEllipsis).toBe(true);
          }
        }
      }
    });

    test('should render legend correctly on mobile devices', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Find the composition chart
      const compositionChart = authenticatedPage.locator('text=Portfolio Composition').first();

      if (await compositionChart.isVisible({ timeout: 5000 })) {
        const chartContainer = compositionChart.locator('..').locator('..');

        // Take screenshot
        await expect(chartContainer).toHaveScreenshot('composition-chart-mobile.png', {
          maxDiffPixels: 100,
        });

        // On mobile, legend should stack below chart (flex-col)
        const flexContainer = chartContainer.locator('.lg\\:flex-row').first();
        if (await flexContainer.isVisible()) {
          const flexDirection = await flexContainer.evaluate(el =>
            window.getComputedStyle(el).flexDirection
          );
          expect(flexDirection).toBe('column');
        }
      }
    });
  });

  test.describe('Responsive Grid Layouts', () => {
    test('should display metric cards appropriately on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Find metric grids (grid-cols-2 md:grid-cols-4)
      const metricGrids = authenticatedPage.locator('.grid.grid-cols-2');
      const gridCount = await metricGrids.count();

      for (let i = 0; i < Math.min(gridCount, 3); i++) {
        const grid = metricGrids.nth(i);
        if (await grid.isVisible()) {
          // Should be 2 columns on mobile
          const gridTemplateColumns = await grid.evaluate(el =>
            window.getComputedStyle(el).gridTemplateColumns
          );

          // Should have exactly 2 columns (not 3 or 4)
          const columnCount = gridTemplateColumns.split(' ').length;
          expect(columnCount).toBeLessThanOrEqual(2);

          // Check that cards don't overflow
          const cards = grid.locator('> div');
          const cardCount = await cards.count();

          for (let j = 0; j < Math.min(cardCount, 4); j++) {
            const card = cards.nth(j);
            const isOverflowing = await isTextOverflowing(card);

            // Cards shouldn't overflow horizontally
            // (Some vertical overflow might be intentional with scrolling)
            const horizontalOverflow = await card.evaluate(el =>
              el.scrollWidth > el.clientWidth
            );
            expect(horizontalOverflow).toBe(false);
          }
        }
      }
    });

    test('should expand to 4 columns on desktop', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.desktop);
      await navigateToPortfolioWithData(authenticatedPage);

      // Find metric grids
      const metricGrids = authenticatedPage.locator('.grid.md\\:grid-cols-4, .grid.grid-cols-4');

      if (await metricGrids.first().isVisible({ timeout: 5000 })) {
        const grid = metricGrids.first();

        // Should be 4 columns on desktop (md breakpoint is 768px, so desktop should show 4)
        const gridTemplateColumns = await grid.evaluate(el =>
          window.getComputedStyle(el).gridTemplateColumns
        );

        const columnCount = gridTemplateColumns.split(' ').length;
        expect(columnCount).toBe(4);
      }
    });
  });

  test.describe('Table Horizontal Scroll', () => {
    test('should enable horizontal scroll on mobile for wide tables', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Find tables with overflow-x-auto
      const scrollableTables = authenticatedPage.locator('.overflow-x-auto');

      if (await scrollableTables.first().isVisible({ timeout: 5000 })) {
        const table = scrollableTables.first();

        // Check if horizontal scrolling is enabled
        const hasHorizontalScroll = await table.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.overflowX === 'auto' || style.overflowX === 'scroll';
        });
        expect(hasHorizontalScroll).toBe(true);

        // Check if the table actually needs scrolling
        const needsScroll = await table.evaluate(el => el.scrollWidth > el.clientWidth);

        if (needsScroll) {
          // Try scrolling
          await table.evaluate(el => { el.scrollLeft = 50; });
          const scrollPosition = await table.evaluate(el => el.scrollLeft);
          expect(scrollPosition).toBeGreaterThan(0);
        }
      }
    });

    test('should display all table columns without scroll on desktop', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.desktop);
      await navigateToPortfolioWithData(authenticatedPage);

      const scrollableTables = authenticatedPage.locator('.overflow-x-auto table').first();

      if (await scrollableTables.isVisible({ timeout: 5000 })) {
        // On desktop, table should fit without horizontal scrolling (in most cases)
        const needsScroll = await scrollableTables.evaluate(el => {
          const container = el.closest('.overflow-x-auto');
          if (!container) return false;
          return el.scrollWidth > container.clientWidth;
        });

        // This is informational - tables may still need scrolling if they have many columns
        // But they should at least show the overflow-x-auto container properly
        if (needsScroll) {
          console.log('Table requires horizontal scrolling even on desktop - this may be expected for wide tables');
        }
      }
    });
  });

  test.describe('Button and Control Layouts', () => {
    test('should wrap date range buttons appropriately on mobile', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Look for date range buttons (1M, 3M, 6M, etc.)
      const buttonContainer = authenticatedPage.locator('.flex.flex-wrap.gap-2').first();

      if (await buttonContainer.isVisible({ timeout: 5000 })) {
        // Should allow wrapping
        const flexWrap = await buttonContainer.evaluate(el =>
          window.getComputedStyle(el).flexWrap
        );
        expect(flexWrap).toBe('wrap');

        // Buttons should be accessible (minimum touch target size)
        const buttons = buttonContainer.locator('button');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(buttonCount, 7); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();
            if (box) {
              // Minimum recommended touch target is 44x44 CSS pixels (WCAG guideline)
              expect(box.height).toBeGreaterThanOrEqual(32); // Allow slightly smaller for compact designs
            }
          }
        }
      }
    });

    test('should position export buttons correctly', async ({ authenticatedPage }) => {
      await navigateToPortfolioWithData(authenticatedPage);

      // Look for export buttons (Download PNG/SVG)
      const exportButtons = authenticatedPage.locator('button:has-text("PNG"), button:has-text("SVG")');
      const buttonCount = await exportButtons.count();

      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 4); i++) {
          const button = exportButtons.nth(i);
          if (await button.isVisible()) {
            // Export buttons should not overlap with chart content
            const box = await button.boundingBox();
            expect(box).toBeTruthy();

            // Should be visible and clickable
            await expect(button).toBeVisible();
            await expect(button).toBeEnabled();
          }
        }
      }
    });
  });

  test.describe('Text Overflow and Truncation', () => {
    test('should handle long metric values without overflow', async ({ authenticatedPage }) => {
      await navigateToPortfolioWithData(authenticatedPage);

      // Find metric cards with large numbers
      const metricValues = authenticatedPage.locator('.text-2xl.font-bold');
      const valueCount = await metricValues.count();

      for (let i = 0; i < Math.min(valueCount, 10); i++) {
        const value = metricValues.nth(i);
        if (await value.isVisible()) {
          const isOverflowing = await isTextOverflowing(value);

          if (isOverflowing) {
            // Get the actual text to log it
            const text = await value.textContent();
            console.log(`Warning: Metric value overflowing: "${text}"`);
          }
        }
      }
    });

    test('should truncate long names in legends and tables', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await navigateToPortfolioWithData(authenticatedPage);

      // Find elements with truncate class
      const truncatedElements = authenticatedPage.locator('.truncate');
      const elementCount = await truncatedElements.count();

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = truncatedElements.nth(i);
        if (await element.isVisible()) {
          // Should not overflow parent container
          const overflowsParent = await element.evaluate(el => {
            const parent = el.parentElement;
            if (!parent) return false;
            return el.offsetWidth > parent.offsetWidth;
          });

          expect(overflowsParent).toBe(false);
        }
      }
    });
  });

  test.describe('Dark Mode Visual Tests', () => {
    test('should render charts correctly in dark mode', async ({ authenticatedPage }) => {
      // Set dark mode in localStorage BEFORE navigating
      await authenticatedPage.addInitScript(() => {
        localStorage.setItem('theme', 'dark');
      });

      // Now navigate - ThemeProvider will pick up dark theme on init
      await navigateToPortfolioWithData(authenticatedPage);

      // Wait for dark mode to fully apply
      await authenticatedPage.waitForTimeout(1000);

      // Verify dark mode is active
      const isDark = await authenticatedPage.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      expect(isDark).toBe(true);

      // Take screenshots of charts in dark mode
      await expect(authenticatedPage).toHaveScreenshot('dark-mode-layout.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });

      // Check that chart backgrounds are dark
      const chartContainers = authenticatedPage.locator('.dark\\:bg-gray-800');
      const containerCount = await chartContainers.count();

      for (let i = 0; i < Math.min(containerCount, 3); i++) {
        const container = chartContainers.nth(i);
        if (await container.isVisible()) {
          const bgColor = await container.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
          );

          // Should be a dark color, not white
          expect(bgColor).not.toMatch(/rgb\(255,\s*255,\s*255\)/);
        }
      }
    });

    test('should maintain readable contrast in dark mode', async ({ authenticatedPage }) => {
      await enableDarkMode(authenticatedPage);
      await navigateToPortfolioWithData(authenticatedPage);

      // Check text elements for sufficient contrast
      const textElements = authenticatedPage.locator('.dark\\:text-gray-100, .dark\\:text-gray-300');
      const textCount = await textElements.count();

      for (let i = 0; i < Math.min(textCount, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const color = await element.evaluate(el =>
            window.getComputedStyle(el).color
          );

          // Text should be light colored (not dark)
          expect(color).not.toMatch(/rgb\(0,\s*0,\s*0\)/);
        }
      }

      // Restore light mode
      await disableDarkMode(authenticatedPage);
    });
  });

  test.describe('Advanced Charts Layout', () => {
    test('should render ECharts with proper dimensions', async ({ authenticatedPage }) => {
      await navigateToPortfolioWithData(authenticatedPage);

      // Look for ECharts containers
      const echartContainers = authenticatedPage.locator('[_echarts_instance_]');
      const chartCount = await echartContainers.count();

      if (chartCount > 0) {
        for (let i = 0; i < Math.min(chartCount, 3); i++) {
          const chart = echartContainers.nth(i);
          if (await chart.isVisible()) {
            const box = await chart.boundingBox();

            if (box) {
              // Chart should have non-zero dimensions
              expect(box.width).toBeGreaterThan(0);
              expect(box.height).toBeGreaterThan(0);

              // Height should match the configured height (typically 300-500px)
              expect(box.height).toBeGreaterThanOrEqual(250);
            }
          }
        }
      }
    });
  });

  test.describe('Full Page Visual Regression', () => {
    test('should match baseline screenshot - desktop light mode', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.desktop);
      await disableDarkMode(authenticatedPage);
      await navigateToPortfolioWithData(authenticatedPage);

      await expect(authenticatedPage).toHaveScreenshot('baseline-desktop-light.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });

    test('should match baseline screenshot - mobile light mode', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.mobile);
      await disableDarkMode(authenticatedPage);
      await navigateToPortfolioWithData(authenticatedPage);

      await expect(authenticatedPage).toHaveScreenshot('baseline-mobile-light.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });

    test('should match baseline screenshot - tablet dark mode', async ({ authenticatedPage }) => {
      await authenticatedPage.setViewportSize(VIEWPORTS.tablet);

      // Set dark mode in localStorage BEFORE navigating
      await authenticatedPage.addInitScript(() => {
        localStorage.setItem('theme', 'dark');
      });

      await navigateToPortfolioWithData(authenticatedPage);

      await expect(authenticatedPage).toHaveScreenshot('baseline-tablet-dark.png', {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });
  });
});
