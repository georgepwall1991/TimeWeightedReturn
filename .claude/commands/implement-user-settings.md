# Implement User Settings

Complete user preferences and settings system with profile management and organization settings.

## Backend
- Create UserPreferences entity (if not exists from dark mode)
- Expand with: DateFormat, TimeZone, NumberFormat, DefaultCurrency, DefaultDateRange, Language, EmailNotifications, ThemePreference
- Profile update endpoints (name, email, password, avatar upload)
- Organization settings (admin only): Name, Logo, PrimaryColor, SecondaryColor, BaseCurrency, TimeZone

## Frontend
- Create comprehensive Settings page with tabs:
  - **Profile**: Name, email, password change, avatar upload
  - **Preferences**: Date format, timezone, number format, default currency, default date range
  - **Appearance**: Theme (light/dark/auto), compact mode
  - **Notifications**: Email preferences, in-app notifications
  - **Organization** (admin only): Org name, logo, branding colors, default settings
  - **API Keys**: Link to API keys page
  - **Privacy**: Link to Privacy Center
- Apply preferences throughout app
- Validation and error handling
- Success/error notifications

## Testing
- Test preference persistence
- Test organization settings (admin only)
- Test avatar upload
- Test password change

## Files
- `src/Domain/Entities/UserPreferences.cs`
- `src/Application/Features/Users/` (expand)
- `src/Api/Controllers/UserController.cs`
- `frontend/src/pages/Settings.tsx` (NEW)
- `frontend/src/components/settings/` (NEW folder)

Execute end-to-end autonomously.
