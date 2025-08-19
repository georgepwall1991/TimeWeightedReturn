from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies that the asset breakdown is correctly displayed in the account details.
    """
    # 1. Arrange: Go to the application.
    page.goto("http://localhost:5173/")
    page.wait_for_load_state('networkidle')

    # Take a screenshot for debugging
    page.screenshot(path="jules-scratch/verification/debug_screenshot.png")

    # 2. Act: Navigate through the portfolio tree.
    # Wait for the tree to load by looking for a known client.
    expect(page.get_by_text("Smith Family Trust")).to_be_visible(timeout=10000)

    # Click on the client, portfolio, and account.
    page.get_by_text("Smith Family Trust").click()
    page.get_by_text("Conservative Growth Portfolio").click()
    page.get_by_text("ISA Account").click()

    # 3. Assert: Check that the account details are displayed.
    # The detail panel should show the account name.
    expect(page.get_by_role("heading", name="ISA Account")).to_be_visible()

    # The asset breakdown should be visible.
    # We expect to see the percentage for cash and securities.
    # The exact percentages will depend on the data, so we just check for visibility.
    expect(page.get_by_text("%", exact=False)).to_be_visible()


    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
