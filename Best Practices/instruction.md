# Test Development Instructions

This file contains guidelines specific to creating and maintaining Playwright tests for the EventParcel dashboard.

## Selector Strategy

### ID-Based Selectors (Most Stable ✅)
Use when available — EventParcel frontend is well-instrumented with IDs:
- Stat cards: `#stat-count-{0,2,3}`, `#stat-title-{0,2,3}`
- Order tabs: `#tab-all-orders`, `#tab-pending`, `#tab-completed`
- Order list: `#orders-list`
- Pagination: `#orders-pagination button`

**Pattern**: `page.locator('#element-id')`

### CSS Class Selectors (Moderate Stability)
Use for repeated elements within containers:
- Order rows: `#orders-list > div.rounded-lg.font-general.cursor-pointer`
- Spinner states: `.spinner`, `.loading`, `[aria-busy="true"]`

**Pattern**: `page.locator('selector:has(nested-selector)')` for complex queries

**⚠️ Avoid**:
- Index-based selectors (`:nth-child()`) — brittle when data changes
- Generic classes like `.btn`, `.card` without parent context
- Deeply nested XPath expressions

### Testing Selector Accuracy
Before using a selector in a test:
1. Open browser DevTools (F12)
2. Use Console: `document.querySelector('#selector-id')`
3. Verify it returns the expected element
4. Test with multiple data states (empty, paginated, etc.)

## Race Condition & Loading State Handling

### Pattern 1: Order List with Spinner (Current Standard)
```javascript
// Wait for EITHER order rows to appear OR loading spinner to disappear
await Promise.race([
  page.waitForSelector('#orders-list > div.rounded-lg.font-general.cursor-pointer', 
    { state: 'visible', timeout: 5000 }),
  page.waitForSelector('.spinner, .loading, [aria-busy="true"]', 
    { state: 'detached', timeout: 5000 }).catch(() => {})
]).catch(() => {});

// Small buffer for UI to settle
await page.waitForTimeout(500);
```

**When to use**: After tab clicks, pagination clicks, or filter operations

### Pattern 2: Element Text Stability
```javascript
// Use toHaveText with longer timeout — waits for text to stabilize
await expect(page.locator('#stat-title-0'))
  .toHaveText('Total Orders', { timeout: 20000 });
```

**When to use**: Dashboard metric cards, page headers where content might load async

### Pattern 3: Navigation Verification
```javascript
// Wait for URL pattern AND element to confirm full page load
await expect(page).toHaveURL(/dashboard/);
await expect(page.locator('#stat-title-0')).toHaveText('Total Orders');
```

**When to use**: After login, after navigation to new page sections

### Common Pitfalls ⚠️
- **Don't** trust button `.isEnabled()` alone — may be stale. Click and verify result instead.
- **Don't** count elements immediately after tab click — may return 0. Use Promise.race pattern.
- **Don't** assume pagination is complete. Check `hasNext` by testing both visibility AND enablement.

## Pagination Testing & Debugging

### countOrdersWithPagination() Pattern
Current implementation in regression.e2e.js is the gold standard:
- Uses Promise.race for loading state
- Takes debug screenshots at each page
- Logs count per page for diagnosis
- Handles edge case of no items (logs outerHTML for debugging)
- Checks `isVisible()` before `isEnabled()` on next button

### Extending Pagination Debugging
To diagnose pagination issues:

1. **Enable full page screenshots**:
   ```javascript
   const screenshotPath = testInfo.outputPath(`${debugLabel}-page-${pageIdx}.png`);
   await page.screenshot({ path: screenshotPath, fullPage: true });
   ```

2. **Log actual DOM structure when count is 0**:
   ```javascript
   const ordersListHtml = await page.locator('#orders-list')
     .evaluate(el => el.outerHTML);
   console.log(`[${debugLabel}] DOM state:`, ordersListHtml);
   ```

3. **Check pagination button state**:
   ```javascript
   const nextBtn = page.locator('#orders-pagination button:has(svg.lucide-chevron-right)');
   console.log(`Next visible: ${await nextBtn.isVisible()}, enabled: ${await nextBtn.isEnabled()}`);
   ```

### Debugging Failed Pagination
If test exits prematurely:
- Check `test-results/` for error-context.md
- Review `playwright-report/` for video timeline
- Run with: `npx playwright test --headed --grep "test-name"` to watch browser
- Add `await page.pause()` before pagination to inspect state interactively

## Screenshot Capture Strategy

### Automatic Capture Points
Playwright captures on failure if enabled in config. For additional debug captures:

```javascript
// After each major action
const screenshotPath = testInfo.outputPath(`action-name-step-N.png`);
await page.screenshot({ path: screenshotPath, fullPage: true });

// Before assertions
const beforePath = testInfo.outputPath(`before-assertion.png`);
await page.screenshot({ path: beforePath });
```

### Using Screenshots in Reports
- Screenshots saved via `testInfo.outputPath()` appear in playwright-report/
- Name files descriptively: `all-orders-page-1.png`, `login-success.png`
- Use `fullPage: true` to capture entire page for scroll-hidden elements

## Test Data Assumptions

### Current Test Environment
- **Test Account**: planner@example.com / <REDACTED — set via .env>
- **Environment**: Live Azure production-like instance
- **Data State**: Unknown — assume data may change between runs
- **Orders in System**: Variable — tests use actual counts, not hardcoded expectations

### Implications for New Tests
- **✅ Do**: Use dynamic counting (like countOrdersWithPagination)
- **❌ Don't**: Hardcode "Expected 42 orders" — data is not under test control
- **✅ Do**: Test relationships (card count == list count)
- **❌ Don't**: Test absolute values without verification source

### Managing Test Isolation
- No test setup/teardown currently implemented
- Tests are read-only (no data creation/deletion)
- Consider adding if future tests require data state management

## Login Flow Best Practices

### Current Pattern (from loginAndWaitForDashboard)
```javascript
async function loginAndWaitForDashboard(page) {
  await page.goto('https://app-serv-eventparcel-frontend-v2-d9c6gphqhmb5gvhc.westeurope-01.azurewebsites.net/login');
  await page.fill('#login-email', TEST_EMAIL);
  await page.fill('#login-password', TEST_PASSWORD);
  await page.click('button:has-text("Sign in with email")');
  // Wait for dashboard element, not just URL
  await expect(page.locator('#stat-title-0'))
    .toHaveText('Total Orders', { timeout: 20000 });
  await expect(page).toHaveURL(/dashboard/);
}
```

### Why This Works
1. **page.fill()** clears field first (safer than type)
2. **Waits for specific element** not just navigation (catches load failures)
3. **Uses timeout of 20s** for potentially slow dashboard render
4. **Verifies both URL and content** for final confirmation

### Extending Login Tests
For new login-related tests:
```javascript
// Test login with invalid credentials
await loginAndWaitForDashboard(page);  // Reuse for successful path

// Test session persistence
await page.reload();
await expect(page).toHaveURL(/dashboard/);  // Should stay authenticated
```

## Adding a New Test

### Template
```javascript
test('Description of what is being validated', async ({ page }, testInfo) => {
  // Setup: Login and navigate
  await loginAndWaitForDashboard(page);
  
  // Action: Interact with page
  await page.click('#selector-id');
  
  // Wait for state change using race pattern
  await Promise.race([
    page.waitForSelector('#target-selector', { state: 'visible', timeout: 5000 }),
    page.waitForSelector('.loading', { state: 'detached', timeout: 5000 }).catch(() => {})
  ]).catch(() => {});
  
  // Assertion: Verify result
  await expect(page.locator('#result-id')).toHaveText('Expected Text', { timeout: 20000 });
  
  // Debug capture (optional)
  const screenshotPath = testInfo.outputPath('final-state.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
});
```

### Checklist
- [ ] Uses `loginAndWaitForDashboard()` for setup
- [ ] Includes timeout on assertions (20s for dynamic, 5s for immediate)
- [ ] Uses Promise.race for loading state handling
- [ ] Tests relationship/logic, not absolute values
- [ ] Has descriptive test name (present tense, clear intent)
- [ ] Tested locally with `--headed` flag
- [ ] Retries don't indicate flakiness (run 3x to verify)

## Debugging Console Output

### Recommended Log Format
All console.log() calls use consistent label format:
```javascript
console.log(`[Label] action: result`);
// Examples:
console.log(`[All Orders] Page 1: Found 15 orders`);
console.log(`[Login] Dashboard loaded successfully`);
console.log(`[Pagination] Next button enabled: true`);
```

### Reading Test Output
```bash
npx playwright test --reporter=list  # Compact output
npx playwright test 2>&1 | grep "\[Label\]"  # Filter by label
npx playwright test --debug  # Step through with Inspector
```

### Verbose Screenshot Logging
If investigating pagination:
```bash
npx playwright test --grep "Pending Orders" --headed
# Watch browser while console logs appear
# Screenshots saved to playwright-report/
```

## Configuration Constants

These are defined in regression.e2e.js — update here if test env changes:

```javascript
const TEST_EMAIL = 'planner@example.com';
const TEST_PASSWORD = '<REDACTED — set via .env>';
// Base URL in loginAndWaitForDashboard() function
```

**For CI/CD**: Extract to environment variables:
```javascript
const TEST_EMAIL = process.env.TEST_EMAIL || 'planner@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || '<REDACTED — set via .env>';
```

## Flaky Test Remedies

If a test fails intermittently:

1. **Add waitForTimeout buffer** (Symptoms: button click doesn't register)
   ```javascript
   await nextBtn.click();
   await page.waitForTimeout(500);  // Wait for state transition
   ```

2. **Increase assertion timeout** (Symptoms: element appears late)
   ```javascript
   await expect(page.locator('#delayed-element'))
     .toHaveText('Text', { timeout: 25000 });  // Increased from 20s
   ```

3. **Use stricter loading pattern** (Symptoms: count is wrong)
   ```javascript
   // More defensive than current Promise.race
   await Promise.all([
     page.waitForSelector('#orders-list', { state: 'visible' }),
     page.locator('.loading').count().then(count => count === 0)
   ]);
   ```

4. **Test in isolation** (Symptoms: fails only when run with others)
   ```bash
   npx playwright test --grep "exact test name"
   # If passes alone, may be test ordering issue
   ```

## Resources & References

- [Playwright Locators](https://playwright.dev/docs/locators)
- [Waiting for Elements](https://playwright.dev/docs/actionability)
- [Test Retries & Flakiness](https://playwright.dev/docs/test-retries)
- [Debugging Tests](https://playwright.dev/docs/debug)
- EventParcel App: `https://app-serv-eventparcel-frontend-v2-d9c6gphqhmb5gvhc.westeurope-01.azurewebsites.net`
