# Improve Loading States

You are improving **Loading States and UX** across the Time-Weighted Return application.

## Context
Enhance the user experience by improving loading indicators, adding skeleton screens, and better error states. This makes the app feel more responsive and professional.

## Implementation Requirements

### Frontend Components

- **Expand Skeleton Components** (`frontend/src/components/common/Skeleton.tsx`)
  - Review existing Skeleton component
  - Add variants for different use cases:
    - `SkeletonCard` - for card-based layouts
    - `SkeletonTable` - for table rows
    - `SkeletonChart` - for chart placeholders
    - `SkeletonTree` - for tree navigation
    - `SkeletonText` - for text content (multiple lines)
    - `SkeletonAvatar` - for user avatars/icons
  - Add pulsing animation
  - Ensure accessible (aria-busy, aria-label)

- **Loading State Patterns:**
  - Create `frontend/src/components/common/LoadingSpinner.tsx`
    - Small, medium, large sizes
    - With optional text label
    - Centered vs inline variants

  - Create `frontend/src/components/common/LoadingOverlay.tsx`
    - Full-page overlay for blocking operations
    - Transparent backdrop
    - Optional progress percentage
    - Cancel button option

- **Error State Components:**
  - Create `frontend/src/components/common/ErrorState.tsx`
    - Display error message
    - Retry button
    - Optional support contact info
    - Different severities (warning, error, critical)

  - Create `frontend/src/components/common/EmptyState.tsx`
    - No data illustration/icon
    - Helpful message
    - Call-to-action button (e.g., "Add your first portfolio")

### Integration into Existing Components

- **Audit and Update These Components:**
  - `PortfolioTree.tsx` - Add SkeletonTree while loading
  - `HoldingsExplorer.tsx` - Add SkeletonTable for holdings data
  - `AccountOverview.tsx` - Add SkeletonCard for metrics
  - `PortfolioOverview.tsx` - Add SkeletonCard for summary
  - `PerformanceChart.tsx` - Add SkeletonChart while loading
  - `BenchmarkManagement.tsx` - Add LoadingSpinner for operations

- **Replace Generic Loading Messages:**
  - Find all instances of simple "Loading..." text
  - Replace with appropriate Skeleton or LoadingSpinner
  - Add meaningful aria-labels

### Error Handling Improvements

- **Enhance Error Messages:**
  - Make error messages user-friendly (not just exception messages)
  - Add error codes for support reference
  - Provide actionable next steps
  - Log detailed errors to console/backend for debugging

- **Retry Logic:**
  - Add retry buttons to all error states
  - Implement exponential backoff for automatic retries
  - Show retry count to user

- **Offline Handling:**
  - Detect offline state
  - Show offline banner/indicator
  - Queue actions for when online returns (optional)

### Progress Indicators

- **Long-Running Operations:**
  - Add progress bars for:
    - File uploads (imports)
    - Large data exports
    - Bulk calculations
    - Report generation
  - Show estimated time remaining if possible

### Accessibility

- Ensure all loading states have proper ARIA attributes
- Use `aria-busy="true"` during loading
- Announce state changes to screen readers
- Maintain focus management during loading/error states

## Acceptance Criteria
- [ ] Skeleton components created for all major layouts
- [ ] LoadingSpinner component with size variants
- [ ] LoadingOverlay for blocking operations
- [ ] ErrorState component with retry functionality
- [ ] EmptyState component for no data scenarios
- [ ] All major components use appropriate loading states
- [ ] No generic "Loading..." text remains
- [ ] Error messages are user-friendly
- [ ] Retry buttons work correctly
- [ ] Progress indicators for long operations
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] All tests passing
- [ ] No console errors

## Related Files
- `frontend/src/components/common/Skeleton.tsx` (expand existing)
- `frontend/src/components/common/LoadingSpinner.tsx` (NEW)
- `frontend/src/components/common/LoadingOverlay.tsx` (NEW)
- `frontend/src/components/common/ErrorState.tsx` (NEW)
- `frontend/src/components/common/EmptyState.tsx` (NEW)
- `frontend/src/components/tree/PortfolioTree.tsx`
- `frontend/src/components/holdings/HoldingsExplorer.tsx`
- `frontend/src/components/analytics/AccountOverview.tsx`
- `frontend/src/components/charts/PerformanceChart.tsx`
- All other component files with loading states

## Implementation Notes
- Use consistent animation timing (e.g., 1.5s pulse)
- Match skeleton shapes to actual content layout
- Consider using react-loading-skeleton library (or custom implementation)
- Test loading states by throttling network in dev tools
- Consider adding loading state delay (show skeleton only after 200-300ms)
- Use Suspense boundaries where appropriate

## Design Guidelines
- Skeleton screens should mirror the actual content structure
- Use subtle, non-distracting animations
- Maintain brand colors for spinners/progress bars
- Ensure sufficient contrast for visibility
- Keep error states positive/helpful, not alarming

Execute this implementation end-to-end autonomously.
