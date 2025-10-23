namespace Application.Services;

/// <summary>
/// Email configuration settings
/// </summary>
public class EmailSettings
{
    public const string SectionName = "Email";

    /// <summary>
    /// SMTP server host
    /// </summary>
    public string SmtpHost { get; set; } = "smtp.gmail.com";

    /// <summary>
    /// SMTP server port (typically 587 for TLS)
    /// </summary>
    public int SmtpPort { get; set; } = 587;

    /// <summary>
    /// Enable SSL/TLS
    /// </summary>
    public bool EnableSsl { get; set; } = true;

    /// <summary>
    /// SMTP username (email address)
    /// </summary>
    public string SmtpUsername { get; set; } = string.Empty;

    /// <summary>
    /// SMTP password or app password
    /// </summary>
    public string SmtpPassword { get; set; } = string.Empty;

    /// <summary>
    /// From email address
    /// </summary>
    public string FromEmail { get; set; } = "noreply@portfolioanalytics.com";

    /// <summary>
    /// From display name
    /// </summary>
    public string FromName { get; set; } = "Portfolio Analytics";

    /// <summary>
    /// Base URL for the frontend application (for reset links)
    /// </summary>
    public string FrontendUrl { get; set; } = "http://localhost:5173";

    /// <summary>
    /// Enable email sending (set to false to disable in development)
    /// </summary>
    public bool EnableEmailSending { get; set; } = false;
}
