using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Identity;

/// <summary>
/// Application user entity extending ASP.NET Core Identity
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    /// <summary>
    /// Client ID for data isolation - users can only access data for their assigned client
    /// Null for Admin users who can access all clients
    /// </summary>
    public Guid? ClientId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Full name for display purposes
    /// </summary>
    public string FullName => $"{FirstName} {LastName}";

    /// <summary>
    /// Navigation property to refresh tokens
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
