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

/**
 * Page Object Model for Management Page
 */
export class ManagementPage {
  readonly page: Page;
  readonly managementNav: Locator;
  readonly portfolioTree: Locator;
  readonly overviewTab: Locator;
  readonly holdingsTab: Locator;
  readonly transactionsTab: Locator;
  readonly datePickerInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.managementNav = page.locator('a[href="/management"]').first();
    this.portfolioTree = page.locator('text=Portfolio Hierarchy');
    this.overviewTab = page.locator('button:has-text("Overview")');
    this.holdingsTab = page.locator('button:has-text("Holdings")');
    this.transactionsTab = page.locator('button:has-text("Transactions")');
    this.datePickerInput = page.locator('input[type="date"]');
  }

  async goto() {
    await this.managementNav.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectClient(clientName: string) {
    await this.page.locator(`text=${clientName}`).first().click();
    await this.page.waitForTimeout(500);
  }

  async selectAccount(accountName: string) {
    await this.page.locator(`text=${accountName}`).first().click();
    await this.page.waitForTimeout(500);
  }

  async expandAccountHoldings(accountName: string) {
    const accountButton = this.page.locator(`button:has-text("${accountName}")`).first();
    await accountButton.click();
    await this.page.waitForTimeout(300);
  }

  async switchToHoldingsTab() {
    await this.holdingsTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToOverviewTab() {
    await this.overviewTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToTransactionsTab() {
    await this.transactionsTab.click();
    await this.page.waitForTimeout(500);
  }

  async setHoldingsDate(date: string) {
    await this.datePickerInput.fill(date);
    await this.page.waitForTimeout(500);
  }
}

/**
 * Page Object Model for Static Data Page
 */
export class StaticDataPage {
  readonly page: Page;
  readonly staticDataNav: Locator;
  readonly securitiesTab: Locator;
  readonly benchmarksTab: Locator;
  readonly newSecurityButton: Locator;
  readonly newBenchmarkButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.staticDataNav = page.locator('a[href="/static-data"]').first();
    this.securitiesTab = page.locator('button:has-text("Securities")');
    this.benchmarksTab = page.locator('button:has-text("Benchmarks")');
    this.newSecurityButton = page.locator('button:has-text("New Security")');
    this.newBenchmarkButton = page.locator('button:has-text("New Benchmark")');
    this.searchInput = page.locator('input[placeholder*="Search"]');
  }

  async goto() {
    await this.staticDataNav.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToSecurities() {
    await this.securitiesTab.click();
    await this.page.waitForTimeout(500);
  }

  async switchToBenchmarks() {
    await this.benchmarksTab.click();
    await this.page.waitForTimeout(500);
  }

  async createSecurity(data: {
    ticker: string;
    name: string;
    currency: string;
    isin?: string;
    assetClass?: string;
  }) {
    await this.newSecurityButton.click();
    await this.page.waitForTimeout(300);

    // Fill form - use exact placeholders
    await this.page.locator('input[placeholder="AAPL"]').fill(data.ticker);
    await this.page.locator('input[placeholder="Apple Inc."]').fill(data.name);

    // Currency field - there are multiple, get the one in basic info section (first one)
    const currencyInputs = this.page.locator('input[placeholder="USD"]');
    await currencyInputs.first().fill(data.currency);

    if (data.isin) {
      await this.page.locator('input[placeholder="US0378331005"]').fill(data.isin);
    }

    if (data.assetClass) {
      // Select the asset class dropdown
      await this.page.locator('select').first().selectOption(data.assetClass);
    }

    // Submit
    await this.page.locator('button[type="submit"]:has-text("Create Security")').click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchSecurities(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500);
  }

  async deleteSecurity(ticker: string) {
    const row = this.page.locator(`tr:has-text("${ticker}")`).first();
    await row.getByRole('button').last().click(); // Delete button (trash icon)

    // Confirm deletion
    this.page.once('dialog', dialog => dialog.accept());
    await this.page.waitForTimeout(500);
  }
}
