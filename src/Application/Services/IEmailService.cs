namespace Application.Services;

/// <summary>
/// Service for sending emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a password reset email
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="resetToken">Password reset token</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SendPasswordResetEmailAsync(string email, string resetToken, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sends an email verification email
    /// </summary>
    /// <param name="email">Recipient email address</param>
    /// <param name="verificationToken">Email verification token</param>
    /// <param name="cancellationToken">Cancellation token</param>
    Task SendEmailVerificationAsync(string email, string verificationToken, CancellationToken cancellationToken = default);
}
