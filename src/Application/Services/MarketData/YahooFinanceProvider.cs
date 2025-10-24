using System.Globalization;
using System.Text.Json;
using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Services.MarketData;

public class YahooFinanceProvider : IMarketDataProvider
{
    private readonly HttpClient _httpClient;
    private readonly YahooFinanceSettings _settings;
    private readonly ILogger<YahooFinanceProvider> _logger;
    private readonly SemaphoreSlim _rateLimiter;
    private DateTime _lastRequestTime = DateTime.MinValue;

    public PriceSource ProviderType => PriceSource.YahooFinance;

    public YahooFinanceProvider(
        HttpClient httpClient,
        IOptions<MarketDataSettings> settings,
        ILogger<YahooFinanceProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value.YahooFinance;
        _logger = logger;
        _rateLimiter = new SemaphoreSlim(1, 1);

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<MarketDataPrice?> GetPriceAsync(string ticker, DateOnly date, CancellationToken cancellationToken = default)
    {
        var prices = await GetPricesAsync(ticker, date, date, cancellationToken);
        return prices.FirstOrDefault();
    }

    public async Task<IEnumerable<MarketDataPrice>> GetPricesAsync(
        string ticker,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            // Convert dates to Unix timestamps
            var period1 = new DateTimeOffset(startDate.ToDateTime(TimeOnly.MinValue)).ToUnixTimeSeconds();
            var period2 = new DateTimeOffset(endDate.ToDateTime(TimeOnly.MinValue).AddDays(1)).ToUnixTimeSeconds();

            var url = $"/download/{ticker}?period1={period1}&period2={period2}&interval=1d&events=history";

            _logger.LogInformation("Fetching prices for {Ticker} from {StartDate} to {EndDate} from Yahoo Finance",
                ticker, startDate, endDate);

            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Yahoo Finance returned error status {StatusCode} for {Ticker}",
                    response.StatusCode, ticker);
                return Enumerable.Empty<MarketDataPrice>();
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            // Parse CSV response
            var prices = new List<MarketDataPrice>();
            var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            if (lines.Length < 2)
            {
                _logger.LogWarning("No price data found for {Ticker}", ticker);
                return Enumerable.Empty<MarketDataPrice>();
            }

            // Skip header line
            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(',');

                if (parts.Length >= 6 &&
                    DateOnly.TryParse(parts[0], out var date) &&
                    decimal.TryParse(parts[4], NumberStyles.Any, CultureInfo.InvariantCulture, out var closePrice))
                {
                    decimal? volume = null;
                    if (parts.Length >= 7 &&
                        decimal.TryParse(parts[6], NumberStyles.Any, CultureInfo.InvariantCulture, out var vol))
                    {
                        volume = vol;
                    }

                    prices.Add(new MarketDataPrice(
                        ticker,
                        date,
                        closePrice,
                        volume,
                        PriceSource.YahooFinance));
                }
            }

            _logger.LogInformation("Retrieved {Count} prices for {Ticker} from Yahoo Finance", prices.Count, ticker);
            return prices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching prices for {Ticker} from Yahoo Finance", ticker);
            return Enumerable.Empty<MarketDataPrice>();
        }
    }

    public async Task<bool> ValidateTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            // Try to fetch a single day of data to validate ticker
            var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var prices = await GetPricesAsync(ticker, yesterday, today, cancellationToken);
            return prices.Any();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating ticker {Ticker} with Yahoo Finance", ticker);
            return false;
        }
    }

    public async Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var yesterday = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var period1 = new DateTimeOffset(yesterday.ToDateTime(TimeOnly.MinValue)).ToUnixTimeSeconds();
            var period2 = new DateTimeOffset(today.ToDateTime(TimeOnly.MinValue)).ToUnixTimeSeconds();

            var response = await _httpClient.GetAsync(
                $"/download/AAPL?period1={period1}&period2={period2}&interval=1d&events=history",
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private async Task EnforceRateLimitAsync(CancellationToken cancellationToken)
    {
        await _rateLimiter.WaitAsync(cancellationToken);
        try
        {
            var timeSinceLastRequest = DateTime.UtcNow - _lastRequestTime;
            var minTimeBetweenRequests = TimeSpan.FromMinutes(1.0 / _settings.RateLimitPerMinute);

            if (timeSinceLastRequest < minTimeBetweenRequests)
            {
                var delayTime = minTimeBetweenRequests - timeSinceLastRequest;
                _logger.LogDebug("Rate limiting: waiting {Delay}ms", delayTime.TotalMilliseconds);
                await Task.Delay(delayTime, cancellationToken);
            }

            _lastRequestTime = DateTime.UtcNow;
        }
        finally
        {
            _rateLimiter.Release();
        }
    }
}
