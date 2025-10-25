using System.Text.Json;
using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Services.MarketData;

public class FinnhubProvider : IMarketDataProvider
{
    private readonly HttpClient _httpClient;
    private readonly FinnhubSettings _settings;
    private readonly ILogger<FinnhubProvider> _logger;
    private readonly SemaphoreSlim _rateLimiter;
    private DateTime _lastRequestTime = DateTime.MinValue;

    public PriceSource ProviderType => PriceSource.Finnhub;

    public FinnhubProvider(
        HttpClient httpClient,
        IOptions<MarketDataSettings> settings,
        ILogger<FinnhubProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value.Finnhub;
        _logger = logger;
        _rateLimiter = new SemaphoreSlim(1, 1);

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<MarketDataPrice?> GetPriceAsync(string ticker, DateOnly date, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            // Convert date to Unix timestamp
            var targetDate = date.ToDateTime(TimeOnly.MinValue);
            var unixTimestamp = new DateTimeOffset(targetDate).ToUnixTimeSeconds();
            var endTimestamp = unixTimestamp + 86400; // Add one day

            var url = $"/stock/candle?symbol={ticker}&resolution=D&from={unixTimestamp}&to={endTimestamp}&token={_settings.ApiKey}";

            _logger.LogInformation("Fetching price for {Ticker} on {Date} from Finnhub", ticker, date);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for error status
            if (jsonDoc.RootElement.TryGetProperty("s", out var status) &&
                status.GetString() != "ok")
            {
                _logger.LogWarning("Finnhub returned non-ok status for {Ticker}: {Status}", ticker, status.GetString());
                return null;
            }

            // Parse candle data
            if (jsonDoc.RootElement.TryGetProperty("c", out var closePrices) &&
                closePrices.GetArrayLength() > 0)
            {
                var closePrice = closePrices[0].GetDecimal();

                decimal? volume = null;
                if (jsonDoc.RootElement.TryGetProperty("v", out var volumes) &&
                    volumes.GetArrayLength() > 0)
                {
                    volume = volumes[0].GetDecimal();
                }

                return new MarketDataPrice(
                    ticker,
                    date,
                    closePrice,
                    volume,
                    PriceSource.Finnhub);
            }

            _logger.LogWarning("No price data found for {Ticker} on {Date}", ticker, date);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching price for {Ticker} on {Date} from Finnhub", ticker, date);
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

            // Convert dates to Unix timestamps
            var fromTimestamp = new DateTimeOffset(startDate.ToDateTime(TimeOnly.MinValue)).ToUnixTimeSeconds();
            var toTimestamp = new DateTimeOffset(endDate.ToDateTime(TimeOnly.MinValue).AddDays(1)).ToUnixTimeSeconds();

            var url = $"/stock/candle?symbol={ticker}&resolution=D&from={fromTimestamp}&to={toTimestamp}&token={_settings.ApiKey}";

            _logger.LogInformation("Fetching prices for {Ticker} from {StartDate} to {EndDate} from Finnhub",
                ticker, startDate, endDate);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for error status
            if (jsonDoc.RootElement.TryGetProperty("s", out var status) &&
                status.GetString() != "ok")
            {
                _logger.LogWarning("Finnhub returned non-ok status for {Ticker}: {Status}", ticker, status.GetString());
                return Enumerable.Empty<MarketDataPrice>();
            }

            // Parse candle data arrays
            if (!jsonDoc.RootElement.TryGetProperty("c", out var closePrices) ||
                !jsonDoc.RootElement.TryGetProperty("t", out var timestamps))
            {
                _logger.LogWarning("No price data found for {Ticker}", ticker);
                return Enumerable.Empty<MarketDataPrice>();
            }

            var prices = new List<MarketDataPrice>();
            var closeArray = closePrices.EnumerateArray().ToArray();
            var timestampArray = timestamps.EnumerateArray().ToArray();

            var volumeArray = jsonDoc.RootElement.TryGetProperty("v", out var volumes)
                ? volumes.EnumerateArray().ToArray()
                : null;

            for (int i = 0; i < closeArray.Length; i++)
            {
                var unixTimestamp = timestampArray[i].GetInt64();
                var date = DateOnly.FromDateTime(DateTimeOffset.FromUnixTimeSeconds(unixTimestamp).DateTime);
                var price = closeArray[i].GetDecimal();
                var volume = volumeArray != null && i < volumeArray.Length
                    ? volumeArray[i].GetDecimal()
                    : (decimal?)null;

                prices.Add(new MarketDataPrice(
                    ticker,
                    date,
                    price,
                    volume,
                    PriceSource.Finnhub));
            }

            _logger.LogInformation("Retrieved {Count} prices for {Ticker} from Finnhub", prices.Count, ticker);
            return prices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching prices for {Ticker} from Finnhub", ticker);
            return Enumerable.Empty<MarketDataPrice>();
        }
    }

    public async Task<bool> ValidateTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            var url = $"/stock/profile2?symbol={ticker}&token={_settings.ApiKey}";

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // If we get a valid profile with ticker, it exists
            return jsonDoc.RootElement.TryGetProperty("ticker", out var tickerProp) &&
                   !string.IsNullOrEmpty(tickerProp.GetString());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating ticker {Ticker} with Finnhub", ticker);
            return false;
        }
    }

    public async Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync(
                $"/stock/profile2?symbol=AAPL&token={_settings.ApiKey}",
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
