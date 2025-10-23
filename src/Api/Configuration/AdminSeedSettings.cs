namespace Api.Configuration;

/// <summary>
/// Configuration settings for admin user seeding
/// </summary>
public class AdminSeedSettings
{
    public const string SectionName = "AdminSeed";

    /// <summary>
    /// Admin user email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Admin user password - MUST be set via environment variables or user secrets
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Admin first name
    /// </summary>
    public string FirstName { get; set; } = "System";

    /// <summary>
    /// Admin last name
    /// </summary>
    public string LastName { get; set; } = "Administrator";

    /// <summary>
    /// Whether to seed the admin user (set to false in production after initial setup)
    /// </summary>
    public bool EnableSeeding { get; set; } = true;
}
