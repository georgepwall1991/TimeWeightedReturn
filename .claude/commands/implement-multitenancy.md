# Implement Multi-Tenancy

You are implementing **Multi-Tenant Architecture** for the Time-Weighted Return application.

## Context
Transform the application from single-tenant (Client-based isolation) to true multi-tenant architecture with Organization-level isolation. This is a CRITICAL foundation for enterprise SaaS deployment. Currently, the app uses `ClientId` on `ApplicationUser` for data isolation, but we need a proper Organization entity that represents a tenant with multiple clients, settings, and subscription management.

## Implementation Requirements

### Domain Layer

- **Create Organization Entity:**
  - `src/Domain/Entities/Organization.cs`
    ```csharp
    public class Organization
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; } // URL-friendly unique identifier
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation
        public virtual ICollection<ApplicationUser> Users { get; set; }
        public virtual ICollection<Client> Clients { get; set; }
        public virtual OrganizationSettings Settings { get; set; }
    }
    ```

- **Create OrganizationSettings Entity:**
  - `src/Domain/Entities/OrganizationSettings.cs`
    ```csharp
    public class OrganizationSettings
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string BaseCurrency { get; set; } = "GBP";
        public string DateFormat { get; set; } = "dd/MM/yyyy";
        public string TimeZone { get; set; } = "UTC";
        public string NumberFormat { get; set; } = "en-GB";
        public int DefaultDateRangeDays { get; set; } = 730;
        public int MaxDateRangeDays { get; set; } = 3650;
        public bool EnableEmailNotifications { get; set; } = true;
        public DateTime UpdatedAt { get; set; }

        // Navigation
        public virtual Organization Organization { get; set; }
    }
    ```

- **Update ApplicationUser:**
  - Replace `ClientId` with `OrganizationId`
  - Keep ClientId only if users can belong to specific clients within org

- **Update Client Entity:**
  - Add `OrganizationId` property
  - Add navigation to Organization

### Infrastructure Layer

- **Update PortfolioContext:**
  - Add `DbSet<Organization>` and `DbSet<OrganizationSettings>`
  - Configure relationships:
    - Organization 1:N Users
    - Organization 1:N Clients
    - Organization 1:1 OrganizationSettings
  - Add entity configurations

- **Create Migration:**
  - Add Organizations table
  - Add OrganizationSettings table
  - Add OrganizationId to Clients table
  - Migrate existing data (create default organization)
  - Update ApplicationUser ClientId -> OrganizationId

- **Create Tenant Middleware:**
  - `src/Infrastructure/Middleware/TenantMiddleware.cs`
    - Extract OrganizationId from authenticated user
    - Store in HttpContext.Items or AsyncLocal
    - Make available to repositories
    - Handle missing tenant gracefully

- **Create Tenant Service:**
  - `src/Infrastructure/Services/TenantService.cs`
    - Interface: `ITenantService`
    - Methods:
      - `Guid GetCurrentTenantId()`
      - `Organization GetCurrentOrganization()`
      - `OrganizationSettings GetCurrentSettings()`
    - Inject into services that need tenant context

- **Update All Repositories:**
  - Add automatic tenant filtering to queries
  - Use global query filters in EF Core:
    ```csharp
    modelBuilder.Entity<Client>()
        .HasQueryFilter(c => c.OrganizationId == tenantId);
    ```
  - Apply to: Client, Portfolio, Account, Holding, CashFlow, Benchmark
  - Ensure all writes include OrganizationId

### Application Layer

- **Create Organization Features:**
  - `src/Application/Features/Organizations/Queries/GetOrganization/`
  - `src/Application/Features/Organizations/Commands/CreateOrganization/`
  - `src/Application/Features/Organizations/Commands/UpdateOrganization/`
  - `src/Application/Features/Organizations/Commands/UpdateOrganizationSettings/`
  - DTOs: `OrganizationDto`, `OrganizationSettingsDto`

- **Update Existing Handlers:**
  - Ensure all queries filter by tenant
  - Ensure all commands set OrganizationId
  - Add validation to prevent cross-tenant data access

### API Layer

- **Create OrganizationController:**
  - `src/Api/Controllers/OrganizationController.cs`
  - Endpoints:
    - `GET /api/organization` - Get current organization
    - `PUT /api/organization` - Update organization (Admin only)
    - `GET /api/organization/settings` - Get settings
    - `PUT /api/organization/settings` - Update settings (Admin only)
  - Require Admin role for updates

- **Update Program.cs:**
  - Register TenantMiddleware
  - Register ITenantService
  - Configure global query filters

- **Update Authorization:**
  - Ensure users can only access their organization's data
  - Add organization-specific Admin role
  - Update policies if needed

### Frontend

- **Create Organization Store:**
  - `frontend/src/store/organizationSlice.ts`
  - Store current organization and settings
  - Load on app initialization

- **Create Organization API:**
  - Update `frontend/src/services/api.ts`
  - Add organization endpoints

- **Create Organization Settings Page:**
  - `frontend/src/pages/OrganizationSettings.tsx` (Admin only)
  - Tabs: General, Branding, Preferences, Users
  - Form to update org name, logo, colors
  - Form to update settings (currency, date format, etc.)
  - Apply branding (logo, colors) to app UI

- **Apply Organization Context:**
  - Use organization settings for date formats throughout app
  - Use organization base currency
  - Apply custom branding (logo in header, primary color)

### Testing

- **Create comprehensive tests:**
  - Unit tests for TenantService
  - Integration tests for tenant isolation
  - Test cross-tenant data access is prevented
  - Test migration creates default organization
  - Test user can only see their org's data

### Data Migration Strategy

- **Migration Script:**
  - Create one "Default Organization" for existing data
  - Assign all existing Clients to Default Organization
  - Assign all existing Users to Default Organization
  - Copy settings from appsettings.json to OrganizationSettings

## Acceptance Criteria
- [ ] Organization entity created with all properties
- [ ] OrganizationSettings entity created
- [ ] Migration adds Organizations and OrganizationSettings tables
- [ ] ApplicationUser updated to use OrganizationId
- [ ] Client entity updated with OrganizationId
- [ ] TenantMiddleware extracts and provides tenant context
- [ ] TenantService provides current organization
- [ ] Global query filters prevent cross-tenant data access
- [ ] All repositories filter by tenant automatically
- [ ] Organization CRUD endpoints working
- [ ] OrganizationSettings CRUD endpoints working
- [ ] Frontend displays organization branding
- [ ] Settings page for admins working
- [ ] Existing data migrated to default organization
- [ ] All tests passing (unit + integration)
- [ ] Authorization prevents cross-tenant access
- [ ] No console errors or warnings

## Related Files
- `src/Domain/Entities/Organization.cs` (NEW)
- `src/Domain/Entities/OrganizationSettings.cs` (NEW)
- `src/Domain/Entities/Client.cs`
- `src/Infrastructure/Identity/ApplicationUser.cs`
- `src/Infrastructure/Data/PortfolioContext.cs`
- `src/Infrastructure/Middleware/TenantMiddleware.cs` (NEW)
- `src/Infrastructure/Services/TenantService.cs` (NEW)
- `src/Application/Features/Organizations/` (NEW folder)
- `src/Api/Controllers/OrganizationController.cs` (NEW)
- `src/Api/Program.cs`
- ALL repository files (add tenant filtering)
- `frontend/src/store/organizationSlice.ts` (NEW)
- `frontend/src/pages/OrganizationSettings.tsx` (NEW)
- `frontend/src/services/api.ts`

## Implementation Notes
- This is a LARGE refactoring - test thoroughly at each step
- Use feature flags to test multi-tenancy without breaking existing functionality
- Consider implementing tenant context in request pipeline early
- Ensure all database queries include tenant filter (critical for security)
- Test with multiple organizations to verify isolation
- Document tenant onboarding process
- Consider subdomain routing (org1.app.com, org2.app.com) in future

## Security Considerations
- CRITICAL: Prevent cross-tenant data leaks
- Validate OrganizationId on all commands/queries
- Never trust OrganizationId from client - always get from authenticated user
- Audit all raw SQL queries to include tenant filter
- Add integration tests specifically for tenant isolation
- Consider row-level security in database (future enhancement)

Execute this implementation end-to-end autonomously. This is complex - proceed carefully and test at each step.
