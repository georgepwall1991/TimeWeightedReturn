namespace Application.Services;

public class FxRateSettings
{
    public const string SectionName = "FxRates";

    public bool EnableAutoUpdate { get; set; } = true;
    public string DefaultProvider { get; set; } = "ExchangeRateApi";
    public List<string> FallbackProviders { get; set; } = new() { "Fixer" };
    public int CacheDurationMinutes { get; set; } = 120; // Cache for 2 hours
    public int MaxRetries { get; set; } = 3;
    public int RetryDelaySeconds { get; set; } = 5;

    public ExchangeRateApiSettings ExchangeRateApi { get; set; } = new();
    public FixerSettings Fixer { get; set; } = new();
}

public class ExchangeRateApiSettings
{
    public string ApiKey { get; set; } = string.Empty; // Optional - free tier doesn't require it
    public string BaseUrl { get; set; } = "https://api.exchangerate-api.com/v4/latest";
    public int RateLimitPerMonth { get; set; } = 1500; // Free tier limit
}

public class FixerSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.fixer.io";
    public int RateLimitPerMonth { get; set; } = 100; // Free tier limit
}
