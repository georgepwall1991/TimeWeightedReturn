# Add Dark Mode

You are implementing **Dark Mode** for the Time-Weighted Return application.

## Context
Add a dark mode theme toggle with user preference persistence. This is a highly requested UX feature that improves usability in different lighting conditions and reduces eye strain.

## Implementation Requirements

### Backend
- Add `Theme` property to `UserPreferences` entity (if not exists, create the entity)
- Add migration for UserPreferences table
- Create endpoints:
  - `GET /api/user/preferences` - Get user preferences
  - `PUT /api/user/preferences` - Update user preferences
- Add DTOs for user preferences

### Frontend
- **Tailwind Configuration:**
  - Update `tailwind.config.js` to enable dark mode with 'class' strategy
  - Add dark mode color variants for all custom colors

- **Theme Context:**
  - Create `frontend/src/contexts/ThemeContext.tsx`
  - Provide theme state and toggle function
  - Persist theme preference to localStorage AND backend
  - Apply `dark` class to `<html>` element when dark mode active

- **UI Components:**
  - Add theme toggle button to `UserMenu.tsx` (sun/moon icons)
  - Use icons from a library or create simple SVG icons
  - Add smooth transition classes for theme switches

- **Update Components:**
  - Audit existing components for hard-coded colors
  - Add dark: variants where needed (bg, text, border colors)
  - Test all charts work well in dark mode (Recharts/Chart.js)

### Documentation
- Add dark mode feature to README
- Document keyboard shortcut for theme toggle (optional: Ctrl+Shift+T)

## Acceptance Criteria
- [ ] UserPreferences entity created with Theme property
- [ ] Backend endpoints for preferences CRUD
- [ ] ThemeContext provides theme state globally
- [ ] Theme toggle button in UserMenu
- [ ] Theme persists across sessions (localStorage + backend)
- [ ] All pages render correctly in dark mode
- [ ] Charts and visualizations work in dark mode
- [ ] Smooth transitions between themes
- [ ] All tests passing
- [ ] No console errors or warnings

## Related Files
- `src/Infrastructure/Data/PortfolioContext.cs` (add UserPreferences DbSet)
- `src/Domain/Entities/UserPreferences.cs` (NEW)
- `src/Application/Features/Users/` (NEW - queries/commands)
- `src/Api/Controllers/UserController.cs` (NEW or expand)
- `frontend/tailwind.config.js`
- `frontend/src/contexts/ThemeContext.tsx` (NEW)
- `frontend/src/components/layout/UserMenu.tsx`
- `frontend/src/App.tsx` (wrap with ThemeProvider)

## Implementation Notes
- Default to system preference if no user preference set
- Use `window.matchMedia('(prefers-color-scheme: dark)')` for system detection
- Ensure WCAG contrast ratios maintained in both themes
- Test with different chart types (line, pie, bar charts)

Execute this implementation end-to-end autonomously.
