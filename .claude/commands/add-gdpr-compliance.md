# Add GDPR Compliance

You are implementing **GDPR Compliance Features** for the Time-Weighted Return application.

## Context
Add features to comply with GDPR requirements: right to data portability, right to erasure (right to be forgotten), consent management, and privacy controls.

## Implementation Requirements

### Domain Layer

- **Create UserConsent Entity:**
  - Track consent for different purposes (Marketing, Analytics, etc.)
  - ConsentType enum: Terms, Privacy, Marketing, Analytics
  - Properties: UserId, ConsentType, Granted, Timestamp, IpAddress

- **Create DataExportRequest Entity:**
  - Track user data export requests
  - Status: Pending, Processing, Completed, Failed

### Application Layer

- **Data Export Feature:**
  - Create command: RequestDataExport
  - Generate ZIP file containing:
    - User profile data (JSON)
    - All portfolios, accounts, holdings (JSON)
    - Activity logs
    - Audit logs
    - All user-created content
  - Email download link to user

- **Data Deletion Feature:**
  - Create command: RequestDataDeletion
  - Anonymize user data (replace with "Deleted User")
  - Keep audit trail but remove PII
  - Handle foreign key relationships (soft delete or anonymize)
  - Require confirmation from user

- **Consent Management:**
  - Create commands: GrantConsent, RevokeConsent
  - Query: GetUserConsents
  - Check consent before sending marketing emails or tracking analytics

### API Layer

- **Create GdprController:**
  - POST /api/gdpr/export - Request data export
  - POST /api/gdpr/delete - Request account deletion
  - GET /api/gdpr/consents - Get user consents
  - PUT /api/gdpr/consent/{type} - Update consent

- **Privacy Endpoints:**
  - GET /api/privacy/policy - Get privacy policy text
  - GET /api/privacy/data-usage - Explain what data is collected

### Frontend

- **Create Privacy Center:**
  - `frontend/src/pages/PrivacyCenter.tsx`
  - Tabs: My Data, Consents, Privacy Policy
  - Download my data button
  - Delete my account button (with confirmation)
  - Consent toggles (Marketing, Analytics)

- **Consent Banner:**
  - Show on first visit
  - Explain cookies/tracking
  - Accept/Reject buttons
  - Link to Privacy Policy

- **Account Deletion Flow:**
  - Multi-step confirmation
  - Explain what will be deleted
  - Require password re-entry
  - Final confirmation

### Documentation

- Create PRIVACY.md - Privacy policy
- Create DATA_RETENTION.md - Data retention policy
- Document GDPR compliance in README

### Testing

- Test data export includes all user data
- Test data deletion anonymizes correctly
- Test consent enforcement
- Test audit trail maintained after deletion

## Acceptance Criteria
- [ ] UserConsent entity created
- [ ] DataExportRequest entity created
- [ ] Data export generates complete ZIP
- [ ] Data export includes all user data
- [ ] Data deletion anonymizes user
- [ ] Consent management working
- [ ] GDPR controller endpoints working
- [ ] Privacy Center page implemented
- [ ] Consent banner on first visit
- [ ] Account deletion with confirmation
- [ ] Privacy policy documented
- [ ] All tests passing

## Related Files
- `src/Domain/Entities/UserConsent.cs` (NEW)
- `src/Domain/Entities/DataExportRequest.cs` (NEW)
- `src/Application/Features/Gdpr/` (NEW)
- `src/Api/Controllers/GdprController.cs` (NEW)
- `frontend/src/pages/PrivacyCenter.tsx` (NEW)
- `frontend/src/components/gdpr/ConsentBanner.tsx` (NEW)
- `PRIVACY.md` (NEW)

Execute this implementation end-to-end autonomously.
