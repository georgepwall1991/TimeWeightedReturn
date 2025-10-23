using Application.Features.Auth.Commands.VerifyEmail;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, VerifyEmailResult>
{
    private readonly PortfolioContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<VerifyEmailCommandHandler> _logger;

    public VerifyEmailCommandHandler(
        PortfolioContext context,
        UserManager<ApplicationUser> userManager,
        ILogger<VerifyEmailCommandHandler> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<VerifyEmailResult> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var token = await _context.EmailVerificationTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken);

        if (token == null)
        {
            _logger.LogWarning("Email verification attempted with invalid token");
            return new VerifyEmailResult(false, "Invalid or expired verification token");
        }

        if (!token.IsValid)
        {
            _logger.LogWarning("Email verification attempted with expired or already used token. UserId: {UserId}", token.UserId);
            return new VerifyEmailResult(false, "Invalid or expired verification token");
        }

        // Mark token as verified
        token.VerifiedAt = DateTime.UtcNow;

        // Update user's EmailConfirmed status
        var user = await _userManager.FindByIdAsync(token.UserId.ToString());
        if (user == null)
        {
            _logger.LogError("User not found for email verification. UserId: {UserId}", token.UserId);
            return new VerifyEmailResult(false, "User not found");
        }

        user.EmailConfirmed = true;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update user email confirmation. UserId: {UserId}, Errors: {Errors}",
                token.UserId, string.Join(", ", result.Errors.Select(e => e.Description)));
            return new VerifyEmailResult(false, "Failed to verify email");
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Email verified successfully for user {UserId}", token.UserId);
        return new VerifyEmailResult(true, "Email verified successfully");
    }
}
