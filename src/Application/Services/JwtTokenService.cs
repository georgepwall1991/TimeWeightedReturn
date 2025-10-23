using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Application.Services;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}

public interface IJwtTokenService
{
    string GenerateAccessToken(Guid userId, string email, string fullName, IList<string> roles, Guid? clientId);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<JwtTokenService> _logger;

    public JwtTokenService(IOptions<JwtSettings> jwtSettings, ILogger<JwtTokenService> logger)
    {
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public string GenerateAccessToken(Guid userId, string email, string fullName, IList<string> roles, Guid? clientId)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("fullName", fullName),
            new(ClaimTypes.NameIdentifier, userId.ToString())
        };

        // Add roles as claims
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        // Add client ID for data isolation (if not admin)
        if (clientId.HasValue)
        {
            claims.Add(new Claim("clientId", clientId.Value.ToString()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey)),
            ValidateLifetime = false // Don't validate expiration for refresh
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                _logger.LogWarning("Invalid JWT token: algorithm mismatch. Expected {ExpectedAlg}, got {ActualAlg}",
                    SecurityAlgorithms.HmacSha256,
                    securityToken is JwtSecurityToken jwt ? jwt.Header.Alg : "unknown");
                return null;
            }

            return principal;
        }
        catch (SecurityTokenExpiredException ex)
        {
            // Token expired - this is expected for refresh token flow
            _logger.LogDebug("Token expired: {Message}", ex.Message);
            throw; // Let caller handle expired tokens
        }
        catch (SecurityTokenInvalidSignatureException ex)
        {
            // Token signature is invalid - possible tampering
            _logger.LogWarning(ex, "Invalid token signature detected. Possible token tampering attempt");
            return null;
        }
        catch (SecurityTokenMalformedException ex)
        {
            // Token is malformed
            _logger.LogWarning(ex, "Malformed JWT token received");
            return null;
        }
        catch (SecurityTokenException ex)
        {
            // Other security token exceptions
            _logger.LogWarning(ex, "Security token validation failed: {Message}", ex.Message);
            return null;
        }
        catch (ArgumentException ex)
        {
            // Invalid arguments (e.g., null or empty token)
            _logger.LogWarning(ex, "Invalid token argument: {Message}", ex.Message);
            return null;
        }
        catch (Exception ex)
        {
            // Unexpected exceptions - log as error and rethrow
            _logger.LogError(ex, "Unexpected error during JWT token validation");
            throw;
        }
    }
}
