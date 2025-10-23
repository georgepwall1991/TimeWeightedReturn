using System.Net;
using System.Net.Mail;
using Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services;

/// <summary>
/// SMTP-based email service implementation
/// </summary>
public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetToken, CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableEmailSending)
        {
            _logger.LogInformation(
                "Email sending is disabled. Password reset email would be sent to {Email} with token: {Token}",
                email, resetToken);
            return;
        }

        var resetLink = $"{_settings.FrontendUrl}/reset-password?token={Uri.EscapeDataString(resetToken)}";

        var subject = "Password Reset Request - Portfolio Analytics";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }}
        .warning {{ background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Password Reset Request</h1>
        </div>
        <div class=""content"">
            <p>Hello,</p>
            <p>We received a request to reset your password for your Portfolio Analytics account.</p>
            <p>Click the button below to reset your password:</p>
            <p style=""text-align: center;"">
                <a href=""{resetLink}"" class=""button"">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style=""word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;"">
                {resetLink}
            </p>
            <div class=""warning"">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <div class=""footer"">
                <p>This is an automated message from Portfolio Analytics. Please do not reply to this email.</p>
                <p>&copy; {DateTime.UtcNow.Year} Portfolio Analytics. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    public async Task SendEmailVerificationAsync(string email, string verificationToken, CancellationToken cancellationToken = default)
    {
        if (!_settings.EnableEmailSending)
        {
            _logger.LogInformation(
                "Email sending is disabled. Verification email would be sent to {Email} with token: {Token}",
                email, verificationToken);
            return;
        }

        var verificationLink = $"{_settings.FrontendUrl}/verify-email?token={Uri.EscapeDataString(verificationToken)}";

        var subject = "Verify Your Email - Portfolio Analytics";
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; }}
        .info {{ background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Welcome to Portfolio Analytics!</h1>
        </div>
        <div class=""content"">
            <p>Hello,</p>
            <p>Thank you for registering with Portfolio Analytics. To complete your registration and start using our platform, please verify your email address.</p>
            <p style=""text-align: center;"">
                <a href=""{verificationLink}"" class=""button"">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style=""word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;"">
                {verificationLink}
            </p>
            <div class=""info"">
                <strong>Note:</strong> This verification link will expire in 7 days.
            </div>
            <p>Once verified, you'll be able to:</p>
            <ul>
                <li>Access your investment portfolios</li>
                <li>View performance analytics</li>
                <li>Calculate time-weighted returns</li>
                <li>Analyze portfolio attribution</li>
            </ul>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
            <div class=""footer"">
                <p>This is an automated message from Portfolio Analytics. Please do not reply to this email.</p>
                <p>&copy; {DateTime.UtcNow.Year} Portfolio Analytics. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(email, subject, body, cancellationToken);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        try
        {
            using var smtpClient = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword),
                DeliveryMethod = SmtpDeliveryMethod.Network
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_settings.FromEmail, _settings.FromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage, cancellationToken);

            _logger.LogInformation("Email sent successfully to {Email} with subject: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email} with subject: {Subject}", toEmail, subject);
            throw;
        }
    }
}
