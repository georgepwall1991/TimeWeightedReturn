import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-600, .text-red-500, .text-red-400');
    this.registerLink = page.locator('text=Register');
    this.forgotPasswordLink = page.locator('text=Forgot your password?');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message?: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    if (message) {
      await this.page.locator(`text=${message}`).waitFor({ state: 'visible' });
    }
  }
}

/**
 * Page Object Model for Main Application
 */
export class AppPage {
  readonly page: Page;
  readonly userMenu: Locator;
  readonly portfolioTree: Locator;
  readonly detailPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    // Match button with aria-label containing user info
    this.userMenu = page.locator('button[aria-label*="User menu"]');
    this.portfolioTree = page.locator('[class*="portfolio"]').first();
    this.detailPanel = page.locator('[class*="detail"]').first();
  }

  async goto() {
    await this.page.goto('/');
  }

  async openUserMenu() {
    // Wait for user menu to be fully ready before clicking
    // Increased timeout for mobile browsers which are slower
    await this.userMenu.waitFor({ state: 'visible', timeout: 20000 });
    await this.userMenu.waitFor({ state: 'attached', timeout: 20000 });
    await this.page.waitForLoadState('networkidle');
    await this.userMenu.click();
  }

  async switchTheme(theme: 'Light' | 'Dark' | 'System') {
    await this.openUserMenu();

    // Wait for menu to be visible and theme buttons to be present
    await this.page.waitForTimeout(1000);

    // Click the theme button - look for button containing the theme text within the dropdown menu
    const themeButton = this.page.locator('.absolute.right-0 button').filter({ hasText: theme }).first();
    await themeButton.click();

    // Wait for theme change to propagate (mobile browsers need more time)
    await this.page.waitForTimeout(1000);

    // Wait for theme to actually apply by checking DOM state
    // Increased timeout for mobile browsers which have slower JavaScript execution
    if (theme === 'Dark') {
      await this.page.waitForSelector('html.dark', { timeout: 10000 });
    } else if (theme === 'Light') {
      // Wait for dark class to be removed
      await this.page.waitForFunction(() => !document.documentElement.classList.contains('dark'), { timeout: 10000 });
    }
    // For System theme, just wait a bit for the change to register
    else {
      await this.page.waitForTimeout(1000);
    }

    // Close menu after selection by clicking outside or pressing Escape
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
  }

  async logout() {
    await this.openUserMenu();
    await this.page.locator('text=Logout').click();
  }
}

/**
 * Page Object Model for Portfolio Tree
 */
export class PortfolioTreePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly expandAllButton: Locator;
  readonly collapseAllButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search"]');
    this.expandAllButton = page.locator('button:has-text("Expand")');
    this.collapseAllButton = page.locator('button:has-text("Collapse")');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500); // Debounce delay
  }

  async expandAll() {
    await this.expandAllButton.click();
  }

  async collapseAll() {
    await this.collapseAllButton.click();
  }

  async selectClient(clientName: string) {
    await this.page.locator(`text=${clientName}`).first().click();
  }

  async selectPortfolio(portfolioName: string) {
    await this.page.locator(`text=${portfolioName}`).first().click();
  }

  async selectAccount(accountNumber: string) {
    await this.page.locator(`text=${accountNumber}`).first().click();
  }
}

/**
 * Page Object Model for Analytics Dashboard
 */
export class AnalyticsDashboard {
  readonly page: Page;
  readonly analyticsTab: Locator;
  readonly holdingsTab: Locator;
  readonly benchmarksTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.analyticsTab = page.locator('button:has-text("Analytics")');
    this.holdingsTab = page.locator('button:has-text("Holdings")');
    this.benchmarksTab = page.locator('button:has-text("Benchmarks")');
  }

  async switchToAnalytics() {
    await this.analyticsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToHoldings() {
    await this.holdingsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToBenchmarks() {
    await this.benchmarksTab.click();
    await this.page.waitForLoadState('networkidle');
  }
}
