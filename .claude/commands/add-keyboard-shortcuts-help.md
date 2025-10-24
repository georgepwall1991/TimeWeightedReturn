# Add Keyboard Shortcuts Help

You are implementing **Keyboard Shortcuts Documentation and Help Modal** for the Time-Weighted Return application.

## Context
The application already has some keyboard shortcuts (Ctrl+B for sidebar toggle, Ctrl+Shift+R for reset width, arrow keys for tree navigation). Make these discoverable and add a help modal to document all shortcuts.

## Implementation Requirements

### Frontend Components

- **Create Keyboard Shortcuts Modal:**
  - `frontend/src/components/common/KeyboardShortcutsModal.tsx`
    - Modal dialog triggered by `?` or `Ctrl+/`
    - Organized by category:
      - Navigation (tree arrows, Ctrl+B sidebar, etc.)
      - Actions (exports, refresh, search)
      - General (help, close modal, etc.)
    - Search/filter shortcuts
    - Keyboard visualization (show keys as buttons/badges)
    - Printable format option
    - Close with Esc or X button

- **Keyboard Shortcut Badge Component:**
  - `frontend/src/components/common/KeyboardBadge.tsx`
    - Display keyboard keys styled as buttons (e.g., "Ctrl + B")
    - Support modifier keys (Ctrl, Shift, Alt, Cmd for Mac)
    - Detect platform and show appropriate key (Ctrl vs Cmd)

- **Keyboard Shortcut Hook:**
  - `frontend/src/hooks/useKeyboardShortcuts.ts`
    - Centralized hook for registering shortcuts
    - Handle key combinations
    - Prevent conflicts
    - Disable in input fields
    - Support both Windows (Ctrl) and Mac (Cmd)

### Document Existing Shortcuts

**Audit and Document:**
- Tree navigation shortcuts (↑ ↓ ← → Enter)
- Ctrl+B - Toggle sidebar
- Ctrl+Shift+R - Reset sidebar width
- Esc - Close modals
- Any other existing shortcuts

### Add New Helpful Shortcuts

**Consider Adding:**
- `?` or `Ctrl+/` - Show keyboard shortcuts modal
- `Ctrl+K` - Global search (if implementing search)
- `Ctrl+E` - Export current view
- `Ctrl+R` - Refresh current view
- `/` - Focus search input
- `Ctrl+,` - Open settings
- `Ctrl+Shift+D` - Toggle dark mode (if implementing)
- `Alt+1`, `Alt+2`, etc. - Switch between main views

### Visual Hints in UI

- **Add Subtle Keyboard Hints:**
  - Tooltips showing shortcuts (e.g., "Export (Ctrl+E)")
  - Small keyboard icon in toolbar that opens shortcuts modal
  - Footer with "Press ? for shortcuts" hint
  - Context-sensitive hints (show relevant shortcuts for current view)

### Help Menu Integration

- **Add Help Menu to UserMenu or Toolbar:**
  - Menu item: "Keyboard Shortcuts" with badge showing `?`
  - Opens KeyboardShortcutsModal
  - Also accessible via `?` key

### Accessibility

- Modal must be keyboard navigable
- Screen reader announcements for shortcuts
- Focus trap in modal
- Return focus to trigger element on close

## Acceptance Criteria
- [ ] KeyboardShortcutsModal component created
- [ ] Modal triggered by `?` key
- [ ] All existing shortcuts documented
- [ ] Shortcuts organized by category
- [ ] Platform-specific keys (Ctrl vs Cmd)
- [ ] Modal searchable/filterable
- [ ] KeyboardBadge component for visual key display
- [ ] useKeyboardShortcuts hook for centralized management
- [ ] Help menu item in UserMenu or toolbar
- [ ] Visual hints in UI (tooltips, footer)
- [ ] Close modal with Esc
- [ ] Focus management correct
- [ ] Accessible (ARIA, keyboard navigation)
- [ ] All tests passing
- [ ] No console errors

## Related Files
- `frontend/src/components/common/KeyboardShortcutsModal.tsx` (NEW)
- `frontend/src/components/common/KeyboardBadge.tsx` (NEW)
- `frontend/src/hooks/useKeyboardShortcuts.ts` (NEW)
- `frontend/src/hooks/useKeyboardNavigation.ts` (review existing)
- `frontend/src/components/layout/UserMenu.tsx` (add help menu item)
- `frontend/src/components/tree/PortfolioTree.tsx` (ensure shortcuts documented)
- `frontend/src/App.tsx` (add global shortcut listeners)

## Implementation Notes
- Prevent shortcuts when user is typing in input fields
- Use event.preventDefault() to avoid browser defaults
- Support both Windows and Mac key conventions
- Consider using a library like `react-hotkeys-hook` or implement custom
- Make shortcuts configurable in user preferences (future enhancement)
- Group shortcuts logically: Navigation, Actions, Views, General
- Add visual feedback when shortcuts are triggered
- Consider adding a "shortcut mode" for power users (vim-style?)

## Shortcut Categories Structure
```typescript
interface ShortcutCategory {
  category: string;
  shortcuts: Array<{
    keys: string[];        // e.g., ['Ctrl', 'B']
    description: string;   // e.g., 'Toggle sidebar'
    action: () => void;
  }>;
}
```

## Example Shortcuts to Document
- **Navigation:**
  - ↑/↓ - Navigate tree nodes
  - →/← - Expand/collapse tree nodes
  - Enter - Select node
  - Ctrl+B - Toggle sidebar

- **Actions:**
  - Ctrl+E - Export current view
  - Ctrl+R - Refresh data
  - Ctrl+K - Open global search

- **General:**
  - ? - Show keyboard shortcuts
  - Esc - Close modal/dialog
  - Ctrl+, - Open settings

Execute this implementation end-to-end autonomously.
