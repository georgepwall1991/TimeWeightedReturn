using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data;

public class IdentitySeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ILogger<IdentitySeeder> _logger;
    private readonly string? _adminEmail;
    private readonly string? _adminPassword;
    private readonly string _adminFirstName;
    private readonly string _adminLastName;
    private readonly bool _enableSeeding;

    public IdentitySeeder(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ILogger<IdentitySeeder> logger,
        string? adminEmail = null,
        string? adminPassword = null,
        string adminFirstName = "System",
        string adminLastName = "Administrator",
        bool enableSeeding = true)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _adminEmail = adminEmail;
        _adminPassword = adminPassword;
        _adminFirstName = adminFirstName;
        _adminLastName = adminLastName;
        _enableSeeding = enableSeeding;
    }

    public async Task SeedAsync()
    {
        if (!_enableSeeding)
        {
            _logger.LogInformation("Admin user seeding is disabled");
            return;
        }

        if (string.IsNullOrWhiteSpace(_adminEmail) || string.IsNullOrWhiteSpace(_adminPassword))
        {
            _logger.LogWarning("Admin user seeding skipped: Email or Password not configured. " +
                "Please set via user secrets or environment variables: " +
                "dotnet user-secrets set 'AdminSeed:Email' 'your@email.com' && " +
                "dotnet user-secrets set 'AdminSeed:Password' 'YourSecurePassword123!'");
            return;
        }

        await SeedRolesAsync();
        await SeedAdminUserAsync();
    }

    private async Task SeedRolesAsync()
    {
        string[] roles = { "Admin", "PortfolioManager", "Analyst", "Viewer" };

        foreach (var roleName in roles)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                var role = new IdentityRole<Guid> { Name = roleName };
                var result = await _roleManager.CreateAsync(role);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Role {RoleName} created successfully", roleName);
                }
                else
                {
                    _logger.LogError("Failed to create role {RoleName}: {Errors}",
                        roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        // Skip seeding if disabled
        if (!_enableSeeding)
        {
            _logger.LogInformation("Admin user seeding is disabled");
            return;
        }

        // Validate configuration
        if (string.IsNullOrWhiteSpace(_adminEmail))
        {
            _logger.LogError("Admin email not configured. Set AdminSeed:Email in configuration or environment variables");
            throw new InvalidOperationException("Admin email is required for seeding. Configure AdminSeed:Email.");
        }

        if (string.IsNullOrWhiteSpace(_adminPassword))
        {
            _logger.LogError("Admin password not configured. Set AdminSeed:Password in user secrets or environment variables");
            throw new InvalidOperationException("Admin password is required for seeding. Configure AdminSeed:Password securely.");
        }

        // Check if admin already exists
        var existingAdmin = await _userManager.FindByEmailAsync(_adminEmail);
        if (existingAdmin != null)
        {
            _logger.LogInformation("Admin user already exists: {Email}", _adminEmail);
            return;
        }

        // Create admin user
        var adminUser = new ApplicationUser
        {
            UserName = _adminEmail,
            Email = _adminEmail,
            FirstName = _adminFirstName,
            LastName = _adminLastName,
            EmailConfirmed = true,
            ClientId = null // Admin has access to all clients
        };

        var result = await _userManager.CreateAsync(adminUser, _adminPassword);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(adminUser, "Admin");
            _logger.LogInformation("Admin user created successfully: {Email}", _adminEmail);
            _logger.LogWarning("SECURITY: Admin user created. Ensure password is changed on first login in production!");
        }
        else
        {
            _logger.LogError("Failed to create admin user: {Errors}",
                string.Join(", ", result.Errors.Select(e => e.Description)));
            throw new InvalidOperationException($"Failed to create admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }
    }
}
