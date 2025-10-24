# Examine Site for Issues and Improvements

Run comprehensive automated site examination using Playwright to identify bugs, visual issues, accessibility problems, performance bottlenecks, and potential improvements.

## Examination Areas

### 1. Bug Detection
- Console errors and warnings
- Network failures and timeouts
- Broken links and 404s
- JavaScript runtime errors
- Failed API calls
- Missing images or assets
- Form submission failures

### 2. Visual Issues
- Dark mode inconsistencies
- Layout shifts and overflow
- Responsive design breakpoints
- Color contrast violations (WCAG)
- Text truncation or overlap
- Missing hover/focus states
- Icon or image rendering issues

### 3. Accessibility
- ARIA violations
- Keyboard navigation coverage
- Screen reader compatibility
- Focus management
- Alt text for images
- Form label associations
- Heading hierarchy

### 4. Performance
- Page load times
- API response times
- Bundle size warnings
- Core Web Vitals (LCP, FID, CLS)
- Memory leaks
- Render-blocking resources

### 5. UX Improvements
- Missing loading states
- Empty state handling
- Error message clarity
- Form validation feedback
- Tooltips and help text
- Mobile usability
- Navigation clarity

### 6. Feature Completeness
- Dead-end user flows
- Incomplete CRUD operations
- Missing breadcrumbs
- Broken navigation paths
- Missing cancel/back buttons
- Unsaved changes warnings

## Examination Process

1. Start backend API and frontend dev server
2. Log in as admin user
3. Systematically navigate all routes
4. Test all interactive elements
5. Check all CRUD operations
6. Verify dark/light theme consistency
7. Test mobile and tablet viewports
8. Run accessibility audits
9. Measure performance metrics
10. Capture screenshots of issues

## Output

Generate a comprehensive markdown report (`audit-reports/site-examination-[date].md`) containing:

- **Executive Summary**: Count of issues by severity
- **Critical Issues**: Must-fix bugs preventing core functionality
- **High Priority**: Significant UX/accessibility problems
- **Medium Priority**: Visual inconsistencies, minor bugs
- **Low Priority**: Nice-to-have improvements
- **Recommendations**: Actionable next steps

Each issue includes:
- Screenshot (if visual)
- Steps to reproduce
- Expected vs actual behavior
- Suggested fix
- Related files/components

Display summary in terminal and path to full report.
