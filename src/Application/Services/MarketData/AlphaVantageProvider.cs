using System.Text.Json;
using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Services.MarketData;

public class AlphaVantageProvider : IMarketDataProvider
{
    private readonly HttpClient _httpClient;
    private readonly AlphaVantageSettings _settings;
    private readonly ILogger<AlphaVantageProvider> _logger;
    private readonly SemaphoreSlim _rateLimiter;
    private DateTime _lastRequestTime = DateTime.MinValue;

    public PriceSource ProviderType => PriceSource.AlphaVantage;

    public AlphaVantageProvider(
        HttpClient httpClient,
        IOptions<MarketDataSettings> settings,
        ILogger<AlphaVantageProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value.AlphaVantage;
        _logger = logger;
        _rateLimiter = new SemaphoreSlim(1, 1);

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<MarketDataPrice?> GetPriceAsync(string ticker, DateOnly date, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            var url = $"?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={_settings.ApiKey}&outputsize=compact";

            _logger.LogInformation("Fetching price for {Ticker} on {Date} from Alpha Vantage", ticker, date);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for API errors
            if (jsonDoc.RootElement.TryGetProperty("Error Message", out var errorMsg))
            {
                _logger.LogWarning("Alpha Vantage returned error for {Ticker}: {Error}", ticker, errorMsg.GetString());
                return null;
            }

            if (jsonDoc.RootElement.TryGetProperty("Note", out var note))
            {
                _logger.LogWarning("Alpha Vantage rate limit message for {Ticker}: {Note}", ticker, note.GetString());
                return null;
            }

            // Parse time series data
            if (!jsonDoc.RootElement.TryGetProperty("Time Series (Daily)", out var timeSeries))
            {
                _logger.LogWarning("No time series data found for {Ticker}", ticker);
                return null;
            }

            var dateString = date.ToString("yyyy-MM-dd");
            if (timeSeries.TryGetProperty(dateString, out var dayData))
            {
                var closePrice = dayData.GetProperty("4. close").GetString();
                var volume = dayData.GetProperty("5. volume").GetString();

                if (decimal.TryParse(closePrice, out var price))
                {
                    return new MarketDataPrice(
                        ticker,
                        date,
                        price,
                        decimal.TryParse(volume, out var vol) ? vol : null,
                        PriceSource.AlphaVantage);
                }
            }

            _logger.LogWarning("No price data found for {Ticker} on {Date}", ticker, date);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching price for {Ticker} on {Date} from Alpha Vantage", ticker, date);
            return null;
        }
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

            var outputsize = (endDate.ToDateTime(TimeOnly.MinValue) - startDate.ToDateTime(TimeOnly.MinValue)).Days > 100
                ? "full"
                : "compact";

            var url = $"?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={_settings.ApiKey}&outputsize={outputsize}";

            _logger.LogInformation("Fetching prices for {Ticker} from {StartDate} to {EndDate} from Alpha Vantage",
                ticker, startDate, endDate);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for API errors
            if (jsonDoc.RootElement.TryGetProperty("Error Message", out var errorMsg))
            {
                _logger.LogWarning("Alpha Vantage returned error for {Ticker}: {Error}", ticker, errorMsg.GetString());
                return Enumerable.Empty<MarketDataPrice>();
            }

            if (jsonDoc.RootElement.TryGetProperty("Note", out var note))
            {
                _logger.LogWarning("Alpha Vantage rate limit message for {Ticker}: {Note}", ticker, note.GetString());
                return Enumerable.Empty<MarketDataPrice>();
            }

            // Parse time series data
            if (!jsonDoc.RootElement.TryGetProperty("Time Series (Daily)", out var timeSeries))
            {
                _logger.LogWarning("No time series data found for {Ticker}", ticker);
                return Enumerable.Empty<MarketDataPrice>();
            }

            var prices = new List<MarketDataPrice>();

            foreach (var property in timeSeries.EnumerateObject())
            {
                if (DateOnly.TryParse(property.Name, out var date) &&
                    date >= startDate && date <= endDate)
                {
                    var closePrice = property.Value.GetProperty("4. close").GetString();
                    var volume = property.Value.GetProperty("5. volume").GetString();

                    if (decimal.TryParse(closePrice, out var price))
                    {
                        prices.Add(new MarketDataPrice(
                            ticker,
                            date,
                            price,
                            decimal.TryParse(volume, out var vol) ? vol : null,
                            PriceSource.AlphaVantage));
                    }
                }
            }

            _logger.LogInformation("Retrieved {Count} prices for {Ticker} from Alpha Vantage", prices.Count, ticker);
            return prices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching prices for {Ticker} from Alpha Vantage", ticker);
            return Enumerable.Empty<MarketDataPrice>();
        }
    }

    public async Task<bool> ValidateTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            var url = $"?function=SYMBOL_SEARCH&keywords={ticker}&apikey={_settings.ApiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            if (jsonDoc.RootElement.TryGetProperty("bestMatches", out var matches))
            {
                foreach (var match in matches.EnumerateArray())
                {
                    if (match.TryGetProperty("1. symbol", out var symbol) &&
                        symbol.GetString()?.Equals(ticker, StringComparison.OrdinalIgnoreCase) == true)
                    {
                        return true;
                    }
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating ticker {Ticker} with Alpha Vantage", ticker);
            return false;
        }
    }

    public async Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"?function=TIME_SERIES_DAILY&symbol=IBM&apikey={_settings.ApiKey}",
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
