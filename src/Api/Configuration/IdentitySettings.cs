namespace Api.Configuration;

public class IdentitySettings
{
    public const string SectionName = "Identity";

    public bool RequireDigit { get; set; } = true;
    public int RequiredLength { get; set; } = 8;
    public bool RequireNonAlphanumeric { get; set; } = true;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireLowercase { get; set; } = true;
    public int MaxFailedAccessAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
}
