using Domain.Entities;
using Domain.Enums;

namespace Application.Services;

public class MarketDataSettings
{
    public const string SectionName = "MarketData";

    public bool EnableAutoUpdate { get; set; } = true;
    public string ScheduleCron { get; set; } = "0 2 * * *"; // Daily at 2 AM
    public PriceSource DefaultProvider { get; set; } = PriceSource.AlphaVantage;
    public List<PriceSource> FallbackProviders { get; set; } = new() { PriceSource.Finnhub, PriceSource.YahooFinance };
    public int CacheDurationMinutes { get; set; } = 60;
    public int MaxRetries { get; set; } = 3;
    public int RetryDelaySeconds { get; set; } = 5;

    public AlphaVantageSettings AlphaVantage { get; set; } = new();
    public FinnhubSettings Finnhub { get; set; } = new();
    public YahooFinanceSettings YahooFinance { get; set; } = new();
}

public class AlphaVantageSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://www.alphavantage.co/query";
    public int RateLimitPerMinute { get; set; } = 5;
    public int RateLimitPerDay { get; set; } = 25;
}

public class FinnhubSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://finnhub.io/api/v1";
    public int RateLimitPerMinute { get; set; } = 60;
}

public class YahooFinanceSettings
{
    public string BaseUrl { get; set; } = "https://query1.finance.yahoo.com/v7/finance";
    public int RateLimitPerMinute { get; set; } = 2000; // No official limit, but be conservative
}
