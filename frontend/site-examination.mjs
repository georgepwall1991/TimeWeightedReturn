import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Comprehensive Site Examination Script
 *
 * Examines the Time-Weighted Return application for:
 * - Bugs and errors
 * - Visual issues
 * - Accessibility problems
 * - Performance bottlenecks
 * - UX improvements
 * - Feature completeness
 */

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './screenshots/examination';
const REPORT_DIR = '../audit-reports';

// Credentials for testing
const ADMIN_CREDENTIALS = {
  email: 'admin@timeweightedreturn.com',
  password: 'Admin@123'
};

// Routes to test
const ROUTES = [
  { path: '/login', name: 'Login Page', requiresAuth: false },
  { path: '/register', name: 'Register Page', requiresAuth: false },
  { path: '/forgot-password', name: 'Forgot Password', requiresAuth: false },
  { path: '/', name: 'Main Dashboard', requiresAuth: true },
];

// Examination results
const results = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: [],
  performance: {},
  accessibility: [],
  consoleErrors: [],
  networkErrors: [],
  visualIssues: []
};

// Helper to capture screenshot
async function captureScreenshot(page, name, fullPage = true) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  const path = join(SCREENSHOT_DIR, filename);

  await page.screenshot({ path, fullPage });
  return filename;
}

// Helper to check console for errors
function setupConsoleMonitoring(page) {
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      results.consoleErrors.push({
        type: 'error',
        message: text,
        location: msg.location()
      });
      console.log(`❌ Console Error: ${text}`);
    } else if (type === 'warning' && !text.includes('React DevTools')) {
      results.consoleErrors.push({
        type: 'warning',
        message: text,
        location: msg.location()
      });
      console.log(`⚠️ Console Warning: ${text}`);
    }
  });

  page.on('pageerror', error => {
    results.critical.push({
      title: 'JavaScript Runtime Error',
      description: error.message,
      severity: 'critical',
      stack: error.stack
    });
    console.log(`💥 Page Error: ${error.message}`);
  });
}

// Helper to monitor network
function setupNetworkMonitoring(page) {
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();

    // Track failed requests
    if (status >= 400) {
      const error = {
        url,
        status,
        statusText: response.statusText()
      };

      try {
        error.body = await response.text();
      } catch (e) {
        error.body = 'Unable to read response body';
      }

      results.networkErrors.push(error);
      console.log(`🔴 Network Error: ${status} ${url}`);
    }
  });

  page.on('requestfailed', request => {
    results.networkErrors.push({
      url: request.url(),
      failure: request.failure().errorText
    });
    console.log(`🔴 Request Failed: ${request.url()} - ${request.failure().errorText}`);
  });
}

// Check color contrast
async function checkColorContrast(page) {
  console.log('🎨 Checking color contrast...');

  try {
    const contrastIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');

      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }

      function getContrastRatio(l1, l2) {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      function parseRgb(color) {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : null;
      }

      for (const el of elements) {
        const text = el.textContent?.trim();
        if (!text || text.length < 2) continue;

        // Skip non-visible elements
        const tagName = el.tagName;
        if (['HTML', 'HEAD', 'SCRIPT', 'STYLE', 'TITLE', 'META', 'LINK'].includes(tagName)) {
          continue;
        }

        const style = window.getComputedStyle(el);

        // Skip invisible elements
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          continue;
        }

        const color = style.color;
        const bgColor = style.backgroundColor;

        const textRgb = parseRgb(color);
        const bgRgb = parseRgb(bgColor);

        if (!textRgb || !bgRgb) continue;

        // Skip transparent backgrounds
        const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (bgMatch && bgMatch[4] === '0') continue;

        const textLum = getLuminance(...textRgb);
        const bgLum = getLuminance(...bgRgb);
        const contrast = getContrastRatio(textLum, bgLum);

        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight);
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);

        const requiredRatio = isLargeText ? 3 : 4.5;

        if (contrast < requiredRatio) {
          issues.push({
            text: text.substring(0, 50),
            contrast: contrast.toFixed(2),
            required: requiredRatio,
            color,
            bgColor,
            selector: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')
          });
        }
      }

      return issues.slice(0, 20); // Limit to 20 issues
    });

    if (contrastIssues.length > 0) {
      results.medium.push({
        title: `Color Contrast Issues (${contrastIssues.length} found)`,
        description: 'Some text does not meet WCAG AA contrast requirements',
        details: contrastIssues,
        severity: 'medium'
      });
    } else {
      results.passed.push('Color contrast meets WCAG AA requirements');
    }
  } catch (error) {
    console.log(`⚠️ Could not check color contrast: ${error.message}`);
  }
}

// Check keyboard navigation
async function checkKeyboardNavigation(page) {
  console.log('⌨️ Checking keyboard navigation...');

  try {
    const navigationIssues = await page.evaluate(() => {
      const issues = [];
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [tabindex]'
      );

      for (const el of interactiveElements) {
        const tabindex = el.getAttribute('tabindex');
        const isHidden = window.getComputedStyle(el).display === 'none' ||
                         window.getComputedStyle(el).visibility === 'hidden';

        // Check for positive tabindex (anti-pattern)
        if (tabindex && parseInt(tabindex) > 0) {
          issues.push({
            issue: 'Positive tabindex',
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            tabindex
          });
        }

        // Check for interactive elements without keyboard access
        if (el.tagName === 'DIV' && el.hasAttribute('onclick') && !el.hasAttribute('tabindex')) {
          issues.push({
            issue: 'Clickable div without tabindex',
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : '')
          });
        }
      }

      return issues;
    });

    if (navigationIssues.length > 0) {
      results.high.push({
        title: `Keyboard Navigation Issues (${navigationIssues.length} found)`,
        description: 'Some interactive elements may not be keyboard accessible',
        details: navigationIssues,
        severity: 'high'
      });
    } else {
      results.passed.push('Keyboard navigation appears properly implemented');
    }
  } catch (error) {
    console.log(`⚠️ Could not check keyboard navigation: ${error.message}`);
  }
}

// Check ARIA and semantic HTML
async function checkAccessibility(page) {
  console.log('♿ Checking accessibility...');

  try {
    const a11yIssues = await page.evaluate(() => {
      const issues = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img');
      for (const img of images) {
        if (!img.hasAttribute('alt')) {
          issues.push({
            issue: 'Image without alt text',
            src: img.src
          });
        }
      }

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input:not([type="hidden"])');
      for (const input of inputs) {
        const id = input.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
            issues.push({
              issue: 'Input without associated label',
              type: input.type,
              name: input.name
            });
          }
        }
      }

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        if (!text && !ariaLabel) {
          issues.push({
            issue: 'Button without accessible name',
            class: button.className
          });
        }
      }

      // Check heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      let previousLevel = 0;
      for (const heading of headings) {
        const level = parseInt(heading.tagName[1]);
        if (previousLevel && level > previousLevel + 1) {
          issues.push({
            issue: 'Heading level skipped',
            from: `h${previousLevel}`,
            to: `h${level}`,
            text: heading.textContent?.trim().substring(0, 50)
          });
        }
        previousLevel = level;
      }

      return issues;
    });

    if (a11yIssues.length > 0) {
      results.high.push({
        title: `Accessibility Issues (${a11yIssues.length} found)`,
        description: 'Elements do not follow accessibility best practices',
        details: a11yIssues,
        severity: 'high'
      });
    } else {
      results.passed.push('Accessibility checks passed');
    }
  } catch (error) {
    console.log(`⚠️ Could not check accessibility: ${error.message}`);
  }
}

// Check responsive design
async function checkResponsive(page, viewport) {
  console.log(`📱 Testing ${viewport.name}...`);

  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.waitForTimeout(500);

  const issues = await page.evaluate(() => {
    const problems = [];

    // Check for horizontal overflow
    const bodyWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;
    if (bodyWidth > windowWidth) {
      problems.push({
        issue: 'Horizontal overflow detected',
        bodyWidth,
        windowWidth
      });
    }

    // Check for elements extending beyond viewport
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 10) {
        problems.push({
          issue: 'Element extends beyond viewport',
          element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
          right: rect.right,
          viewportWidth: window.innerWidth
        });
        break; // Only report one to avoid spam
      }
    }

    return problems;
  });

  if (issues.length > 0) {
    results.medium.push({
      title: `Responsive Issues on ${viewport.name}`,
      description: `Layout problems detected on ${viewport.width}x${viewport.height}`,
      details: issues,
      severity: 'medium'
    });
  }

  return issues.length === 0;
}

// Check performance metrics
async function checkPerformance(page, pageName) {
  console.log('⚡ Measuring performance...');

  try {
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      const perfEntries = window.performance.getEntriesByType('navigation')[0];

      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        pageLoad: perfData.loadEventEnd - perfData.navigationStart,
        domInteractive: perfData.domInteractive - perfData.navigationStart,
        firstPaint: perfEntries?.domContentLoadedEventStart || 0,
        resourceCount: window.performance.getEntriesByType('resource').length
      };
    });

    results.performance[pageName] = metrics;

    // Check for performance issues
    if (metrics.pageLoad > 3000) {
      results.medium.push({
        title: `Slow Page Load: ${pageName}`,
        description: `Page took ${metrics.pageLoad}ms to load (target: <3000ms)`,
        severity: 'medium'
      });
    }

    if (metrics.domContentLoaded > 2000) {
      results.low.push({
        title: `Slow DOM Content Loaded: ${pageName}`,
        description: `DOM took ${metrics.domContentLoaded}ms to become interactive (target: <2000ms)`,
        severity: 'low'
      });
    }
  } catch (error) {
    console.log(`⚠️ Could not measure performance: ${error.message}`);
  }
}

// Check dark mode consistency
async function checkDarkMode(page, pageName) {
  console.log('🌙 Checking dark mode...');

  // Enable dark mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(300);

  const screenshot1 = await captureScreenshot(page, `${pageName}-dark`);

  // Check for elements that don't respect dark mode
  const issues = await page.evaluate(() => {
    const problems = [];
    const elements = document.querySelectorAll('*');

    for (const el of elements) {
      // Skip non-visible elements
      const tagName = el.tagName;
      if (['HTML', 'HEAD', 'SCRIPT', 'STYLE', 'TITLE', 'META', 'LINK'].includes(tagName)) {
        continue;
      }

      const style = window.getComputedStyle(el);

      // Skip invisible elements
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        continue;
      }

      const bgColor = style.backgroundColor;
      const color = style.color;

      // Check for pure white backgrounds in dark mode (likely not themed)
      if (bgColor === 'rgb(255, 255, 255)' || bgColor === 'rgba(255, 255, 255, 1)') {
        const text = el.textContent?.trim().substring(0, 30);
        if (text && text.length > 2) {
          problems.push({
            issue: 'White background in dark mode',
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            text
          });
        }
      }

      // Check for pure black text in dark mode (likely not themed)
      if (color === 'rgb(0, 0, 0)' || color === 'rgba(0, 0, 0, 1)') {
        const text = el.textContent?.trim().substring(0, 30);
        if (text && text.length > 2) {
          problems.push({
            issue: 'Black text in dark mode',
            element: el.tagName + (el.className ? '.' + el.className.split(' ')[0] : ''),
            text
          });
        }
      }
    }

    return problems.slice(0, 10); // Limit to 10 issues
  });

  if (issues.length > 0) {
    results.medium.push({
      title: `Dark Mode Issues: ${pageName}`,
      description: 'Some elements do not properly support dark mode',
      details: issues,
      screenshot: screenshot1,
      severity: 'medium'
    });
  }

  // Switch back to light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await page.waitForTimeout(300);
}

// Login helper
async function login(page) {
  console.log('🔐 Logging in...');

  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[type="password"]', ADMIN_CREDENTIALS.password);

  await Promise.all([
    page.waitForResponse(response =>
      response.url().includes('/api/auth/login'),
      { timeout: 10000 }
    ),
    page.click('button[type="submit"]')
  ]);

  // Wait for navigation
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 5000 });
  console.log('✅ Login successful');
}

// Test form validation
async function testFormValidation(page) {
  console.log('📝 Testing form validation...');

  // Go to login page
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // Try submitting empty form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  // Check for validation messages (both custom and HTML5)
  const validationMessages = await page.evaluate(() => {
    const messages = [];

    // Check for custom validation messages
    const errorElements = document.querySelectorAll('.text-red-500, .text-red-600, .text-red-400, [role="alert"]');
    for (const el of errorElements) {
      const text = el.textContent?.trim();
      if (text && text.length > 0) messages.push(text);
    }

    // Check for HTML5 validation on inputs
    const inputs = document.querySelectorAll('input[required]');
    for (const input of inputs) {
      if (!input.validity.valid) {
        messages.push(`${input.name || input.type} validation active`);
      }
    }

    return messages;
  });

  // Also check if the form actually submitted (it shouldn't have)
  const currentUrl = page.url();
  const formSubmitted = !currentUrl.includes('/login');

  if (validationMessages.length === 0 && formSubmitted) {
    results.high.push({
      title: 'Missing Form Validation',
      description: 'Login form allows submission without validation',
      severity: 'high'
    });
  } else {
    results.passed.push(`Form validation working correctly (${validationMessages.length} validation checks active)`);
  }
}

// Test CRUD operations
async function testCrudOperations(page) {
  console.log('🔧 Testing CRUD operations...');

  await login(page);

  // Test navigation to different sections
  const sections = [
    { name: 'Holdings', selector: 'text=Holdings', url: '/' },
    { name: 'Analytics', selector: 'text=Analytics', url: '/analytics' }
  ];

  for (const section of sections) {
    try {
      const element = await page.$(section.selector);
      if (element) {
        await element.click();
        await page.waitForTimeout(1000);
        results.passed.push(`${section.name} section accessible`);
      }
    } catch (error) {
      results.high.push({
        title: `Cannot Access ${section.name}`,
        description: `Failed to navigate to ${section.name} section`,
        error: error.message,
        severity: 'high'
      });
    }
  }
}

// Generate markdown report
function generateReport() {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  const totalIssues = results.critical.length + results.high.length +
                      results.medium.length + results.low.length;

  let report = `# Site Examination Report\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `## Executive Summary\n\n`;
  report += `| Severity | Count |\n`;
  report += `|----------|-------|\n`;
  report += `| 🔴 Critical | ${results.critical.length} |\n`;
  report += `| 🟠 High | ${results.high.length} |\n`;
  report += `| 🟡 Medium | ${results.medium.length} |\n`;
  report += `| 🔵 Low | ${results.low.length} |\n`;
  report += `| ✅ Passed | ${results.passed.length} |\n`;
  report += `| **Total Issues** | **${totalIssues}** |\n\n`;

  // Console Errors
  if (results.consoleErrors.length > 0) {
    report += `## Console Errors & Warnings (${results.consoleErrors.length})\n\n`;
    results.consoleErrors.slice(0, 20).forEach((error, i) => {
      report += `### ${i + 1}. ${error.type.toUpperCase()}\n\n`;
      report += `**Message:** \`${error.message}\`\n\n`;
      if (error.location) {
        report += `**Location:** ${error.location.url}:${error.location.lineNumber}\n\n`;
      }
    });
  }

  // Network Errors
  if (results.networkErrors.length > 0) {
    report += `## Network Errors (${results.networkErrors.length})\n\n`;
    results.networkErrors.forEach((error, i) => {
      report += `### ${i + 1}. ${error.status || 'Failed'} - ${error.url}\n\n`;
      if (error.failure) {
        report += `**Failure:** ${error.failure}\n\n`;
      }
      if (error.body) {
        report += `**Response:** \`${error.body.substring(0, 200)}\`\n\n`;
      }
    });
  }

  // Critical Issues
  if (results.critical.length > 0) {
    report += `## 🔴 Critical Issues\n\n`;
    results.critical.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.title}\n\n`;
      report += `${issue.description}\n\n`;
      if (issue.stack) {
        report += `\`\`\`\n${issue.stack}\n\`\`\`\n\n`;
      }
    });
  }

  // High Priority Issues
  if (results.high.length > 0) {
    report += `## 🟠 High Priority Issues\n\n`;
    results.high.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.title}\n\n`;
      report += `${issue.description}\n\n`;
      if (issue.details && Array.isArray(issue.details)) {
        report += `**Details:**\n\n`;
        issue.details.slice(0, 5).forEach(detail => {
          report += `- ${JSON.stringify(detail, null, 2).substring(0, 200)}\n`;
        });
        if (issue.details.length > 5) {
          report += `\n...and ${issue.details.length - 5} more\n`;
        }
        report += `\n`;
      }
    });
  }

  // Medium Priority Issues
  if (results.medium.length > 0) {
    report += `## 🟡 Medium Priority Issues\n\n`;
    results.medium.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.title}\n\n`;
      report += `${issue.description}\n\n`;
      if (issue.screenshot) {
        report += `**Screenshot:** \`screenshots/examination/${issue.screenshot}\`\n\n`;
      }
      if (issue.details && Array.isArray(issue.details)) {
        report += `<details>\n<summary>View Details (${issue.details.length} items)</summary>\n\n`;
        issue.details.slice(0, 10).forEach(detail => {
          report += `- ${JSON.stringify(detail, null, 2)}\n`;
        });
        report += `\n</details>\n\n`;
      }
    });
  }

  // Low Priority Issues
  if (results.low.length > 0) {
    report += `## 🔵 Low Priority Issues\n\n`;
    results.low.forEach((issue, i) => {
      report += `### ${i + 1}. ${issue.title}\n\n`;
      report += `${issue.description}\n\n`;
    });
  }

  // Performance Metrics
  if (Object.keys(results.performance).length > 0) {
    report += `## ⚡ Performance Metrics\n\n`;
    report += `| Page | DOM Content Loaded | Page Load | Resources |\n`;
    report += `|------|-------------------|-----------|----------|\n`;
    for (const [page, metrics] of Object.entries(results.performance)) {
      report += `| ${page} | ${metrics.domContentLoaded}ms | ${metrics.pageLoad}ms | ${metrics.resourceCount} |\n`;
    }
    report += `\n`;
  }

  // Passed Checks
  if (results.passed.length > 0) {
    report += `## ✅ Passed Checks (${results.passed.length})\n\n`;
    results.passed.forEach(check => {
      report += `- ${check}\n`;
    });
    report += `\n`;
  }

  // Recommendations
  report += `## 📋 Recommendations\n\n`;
  if (totalIssues === 0) {
    report += `Excellent! No significant issues detected. Continue monitoring:\n\n`;
    report += `1. Keep dependencies up to date\n`;
    report += `2. Monitor performance metrics regularly\n`;
    report += `3. Run accessibility audits on new features\n`;
    report += `4. Test on actual devices periodically\n`;
  } else {
    report += `Priority action items:\n\n`;
    if (results.critical.length > 0) {
      report += `1. **URGENT:** Fix critical issues immediately - these break core functionality\n`;
    }
    if (results.high.length > 0) {
      report += `2. Address high priority issues - significant UX/accessibility impact\n`;
    }
    if (results.medium.length > 0) {
      report += `3. Review medium priority issues - improve visual consistency and UX\n`;
    }
    if (results.low.length > 0) {
      report += `4. Consider low priority improvements - nice-to-have enhancements\n`;
    }
  }

  return report;
}

// Main execution
(async () => {
  console.log('🚀 Starting comprehensive site examination...\n');

  // Create directories
  if (!existsSync(SCREENSHOT_DIR)) {
    await mkdir(SCREENSHOT_DIR, { recursive: true });
  }
  if (!existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Setup monitoring
  setupConsoleMonitoring(page);
  setupNetworkMonitoring(page);

  try {
    // Test form validation
    await testFormValidation(page);

    // Login and test main app
    await login(page);

    // Check main dashboard
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await checkPerformance(page, 'Main Dashboard');
    await captureScreenshot(page, 'dashboard-light');

    // Check accessibility
    await checkAccessibility(page);
    await checkKeyboardNavigation(page);
    await checkColorContrast(page);

    // Check dark mode
    await checkDarkMode(page, 'dashboard');

    // Check responsive design
    const viewports = [
      { name: 'Mobile (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Desktop (1920x1080)', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await checkResponsive(page, viewport);
    }

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Test CRUD operations
    await testCrudOperations(page);

    console.log('\n✅ Examination complete!\n');

  } catch (error) {
    console.error('❌ Fatal error during examination:', error);
    results.critical.push({
      title: 'Examination Failed',
      description: error.message,
      stack: error.stack,
      severity: 'critical'
    });
  } finally {
    await browser.close();

    // Generate report
    const report = generateReport();
    const date = new Date().toISOString().split('T')[0];
    const reportPath = join(REPORT_DIR, `site-examination-${date}.md`);

    await writeFile(reportPath, report);

    console.log('📊 Report Summary:');
    console.log(`   Critical: ${results.critical.length}`);
    console.log(`   High: ${results.high.length}`);
    console.log(`   Medium: ${results.medium.length}`);
    console.log(`   Low: ${results.low.length}`);
    console.log(`   Passed: ${results.passed.length}`);
    console.log(`\n📄 Full report: ${reportPath}\n`);
  }
})();
