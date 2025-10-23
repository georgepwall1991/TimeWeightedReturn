namespace Infrastructure.Identity;

/// <summary>
/// Refresh token entity for secure token storage and rotation
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; }
    public required string Token { get; set; }
    public required Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    public string? RevokedReason { get; set; }

    /// <summary>
    /// IP address that requested the token
    /// </summary>
    public string? IpAddress { get; set; }

    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;

    /// <summary>
    /// Navigation property to user
    /// </summary>
    public ApplicationUser User { get; set; } = null!;
}
