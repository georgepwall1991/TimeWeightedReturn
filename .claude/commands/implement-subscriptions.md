# Implement Subscriptions

You are implementing **Subscription and Billing Framework** for the Time-Weighted Return application.

## Context
Add subscription tiers (Basic, Professional, Enterprise) with feature flags, usage tracking, and billing integration preparation. This enables SaaS monetization and usage-based limits.

## Implementation Requirements

### Domain Layer

- **Create Subscription Entity:**
  - `src/Domain/Entities/Subscription.cs`
  - Properties: Id, OrganizationId, Plan (enum), Status (Active/Canceled/Expired), StartDate, EndDate, TrialEndDate, BillingCycle, Price, Currency, StripeSubscriptionId, Features (JSON)

- **Create SubscriptionPlan Enum:**
  - Basic, Professional, Enterprise, Custom

- **Create SubscriptionStatus Enum:**
  - Trial, Active, PastDue, Canceled, Expired

- **Create UsageTracking Entity:**
  - Track API calls, storage, users, calculations per organization
  - Daily/monthly rollup

### Infrastructure Layer

- **Add Subscription Relationship to Organization:**
  - One organization has one active subscription

- **Create Feature Flag Service:**
  - `src/Infrastructure/Services/FeatureFlagService.cs`
  - Check if feature enabled for current organization's plan
  - Features: AdvancedAnalytics, PdfReports, ApiAccess, CustomBranding, etc.

- **Add Migration:**
  - Subscriptions table
  - UsageTracking table
  - Link Organization to Subscription

### Application Layer

- **Create Subscription Features:**
  - GetSubscription query
  - CreateSubscription command
  - UpdateSubscription command
  - CancelSubscription command
  - CheckFeatureAccess query

- **Feature Flags Configuration:**
  - Define features per plan in appsettings.json or database
  - Example:
    ```json
    {
      "Basic": ["BasicReports", "MaxUsers:5"],
      "Professional": ["BasicReports", "AdvancedAnalytics", "PdfReports", "MaxUsers:25"],
      "Enterprise": ["All", "MaxUsers:unlimited"]
    }
    ```

- **Add Feature Authorization:**
  - Create custom authorization requirement: `RequireFeature`
  - Use in handlers/controllers to enforce limits

### API Layer

- **Create SubscriptionController:**
  - GET /api/subscription - Get current subscription
  - PUT /api/subscription/upgrade - Upgrade plan
  - POST /api/subscription/cancel - Cancel subscription
  - GET /api/subscription/usage - Get usage stats
  - POST /api/webhooks/stripe - Stripe webhook handler (prepare)

- **Add Feature Checks:**
  - Add [RequireFeature("PdfReports")] attribute to restricted endpoints
  - Return 403 Forbidden if feature not available

### Frontend

- **Create Subscription Page:**
  - `frontend/src/pages/Subscription.tsx`
  - Show current plan, features, usage
  - Upgrade/downgrade buttons
  - Billing history (future)

- **Create Pricing Page:**
  - `frontend/src/pages/Pricing.tsx`
  - Show plan comparison table
  - Highlight current plan
  - Upgrade CTA

- **Add Feature Gates:**
  - Disable/hide features not in current plan
  - Show upgrade prompts when accessing restricted features
  - Display usage limits (e.g., "4/5 users")

### Testing

- Test feature flag checks
- Test subscription upgrade/downgrade
- Test usage tracking
- Test feature gates in UI

## Acceptance Criteria
- [ ] Subscription entity created
- [ ] SubscriptionPlan and SubscriptionStatus enums
- [ ] UsageTracking entity and tracking logic
- [ ] FeatureFlagService implemented
- [ ] Feature flags configurable per plan
- [ ] Feature authorization working
- [ ] Subscription CRUD endpoints
- [ ] Frontend subscription page
- [ ] Pricing page with plan comparison
- [ ] Feature gates in UI
- [ ] Usage limits enforced
- [ ] All tests passing

## Related Files
- `src/Domain/Entities/Subscription.cs` (NEW)
- `src/Domain/Entities/UsageTracking.cs` (NEW)
- `src/Domain/Enums/SubscriptionPlan.cs` (NEW)
- `src/Infrastructure/Services/FeatureFlagService.cs` (NEW)
- `src/Application/Features/Subscriptions/` (NEW)
- `src/Api/Controllers/SubscriptionController.cs` (NEW)
- `frontend/src/pages/Subscription.tsx` (NEW)
- `frontend/src/pages/Pricing.tsx` (NEW)

Execute this implementation end-to-end autonomously.
