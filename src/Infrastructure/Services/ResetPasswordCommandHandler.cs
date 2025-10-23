using Application.Features.Auth.Commands.ResetPassword;
using Infrastructure.Data;
using Infrastructure.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, ResetPasswordResult>
{
    private readonly PortfolioContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<ResetPasswordCommandHandler> _logger;

    public ResetPasswordCommandHandler(
        PortfolioContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<ResetPasswordCommandHandler> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ResetPasswordResult> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var token = await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken);

        if (token == null)
        {
            _logger.LogWarning("Password reset attempted with invalid token");
            return new ResetPasswordResult(false, "Invalid or expired reset token");
        }

        if (!token.IsValid)
        {
            _logger.LogWarning("Password reset attempted with expired or used token. UserId: {UserId}", token.UserId);
            return new ResetPasswordResult(false, "Invalid or expired reset token");
        }

        var user = await _userManager.FindByIdAsync(token.UserId.ToString());
        if (user == null)
        {
            _logger.LogError("User not found for password reset. UserId: {UserId}", token.UserId);
            return new ResetPasswordResult(false, "User not found");
        }

        // Remove old password and set new one
        var removePasswordResult = await _userManager.RemovePasswordAsync(user);
        if (!removePasswordResult.Succeeded)
        {
            _logger.LogError("Failed to remove old password. UserId: {UserId}", token.UserId);
            return new ResetPasswordResult(false, "Failed to reset password");
        }

        var addPasswordResult = await _userManager.AddPasswordAsync(user, request.NewPassword);
        if (!addPasswordResult.Succeeded)
        {
            var errors = string.Join(", ", addPasswordResult.Errors.Select(e => e.Description));
            _logger.LogError("Failed to add new password. UserId: {UserId}, Errors: {Errors}", token.UserId, errors);
            return new ResetPasswordResult(false, $"Failed to reset password: {errors}");
        }

        // Mark token as used
        token.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Revoke all existing refresh tokens for security
        var refreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == user.Id && rt.RevokedAt == null)
            .ToListAsync(cancellationToken);

        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedReason = "Password reset";
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Password reset successfully for user {UserId}", token.UserId);
        return new ResetPasswordResult(true, "Password reset successfully");
    }
}
