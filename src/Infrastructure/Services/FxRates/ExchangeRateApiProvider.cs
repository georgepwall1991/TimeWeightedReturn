using System.Text.Json;
using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services.FxRates;

public class ExchangeRateApiProvider : IFxRateProvider
{
    private readonly HttpClient _httpClient;
    private readonly ExchangeRateApiSettings _settings;
    private readonly ILogger<ExchangeRateApiProvider> _logger;
    private readonly SemaphoreSlim _rateLimiter;
    private DateTime _lastRequestTime = DateTime.MinValue;

    public string ProviderName => "ExchangeRateApi";

    public ExchangeRateApiProvider(
        HttpClient httpClient,
        IOptions<FxRateSettings> settings,
        ILogger<ExchangeRateApiProvider> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value.ExchangeRateApi;
        _logger = logger;
        _rateLimiter = new SemaphoreSlim(1, 1);

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<decimal?> GetFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            // ExchangeRate-API provides current rates for free tier
            // For historical rates, we'll use the latest available which is good enough for most use cases
            var url = $"/{baseCurrency}";

            _logger.LogInformation(
                "Fetching FX rate for {Base}/{Quote} from ExchangeRate-API",
                baseCurrency, quoteCurrency);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for API errors
            if (jsonDoc.RootElement.TryGetProperty("error", out var error))
            {
                _logger.LogWarning(
                    "ExchangeRate-API returned error for {Base}/{Quote}: {Error}",
                    baseCurrency, quoteCurrency, error.GetString());
                return null;
            }

            // Parse rates data
            if (!jsonDoc.RootElement.TryGetProperty("rates", out var rates))
            {
                _logger.LogWarning(
                    "No rates data found for {Base}",
                    baseCurrency);
                return null;
            }

            if (rates.TryGetProperty(quoteCurrency, out var rateElement))
            {
                if (rateElement.ValueKind == JsonValueKind.Number &&
                    rateElement.TryGetDecimal(out var rate))
                {
                    _logger.LogInformation(
                        "Successfully fetched FX rate for {Base}/{Quote}: {Rate}",
                        baseCurrency, quoteCurrency, rate);
                    return rate;
                }
            }

            _logger.LogWarning(
                "No FX rate found for {Base}/{Quote}",
                baseCurrency, quoteCurrency);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error fetching FX rate for {Base}/{Quote} from ExchangeRate-API",
                baseCurrency, quoteCurrency);
            return null;
        }
    }

    public async Task<Dictionary<string, decimal>> GetMultipleFxRatesAsync(
        string baseCurrency,
        IEnumerable<string> quoteCurrencies,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, decimal>();

        try
        {
            await EnforceRateLimitAsync(cancellationToken);

            var url = $"/{baseCurrency}";

            _logger.LogInformation(
                "Fetching multiple FX rates for {Base} from ExchangeRate-API",
                baseCurrency);

            var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            var jsonDoc = JsonDocument.Parse(content);

            // Check for API errors
            if (jsonDoc.RootElement.TryGetProperty("error", out var error))
            {
                _logger.LogWarning(
                    "ExchangeRate-API returned error for {Base}: {Error}",
                    baseCurrency, error.GetString());
                return result;
            }

            // Parse rates data
            if (!jsonDoc.RootElement.TryGetProperty("rates", out var rates))
            {
                _logger.LogWarning("No rates data found for {Base}", baseCurrency);
                return result;
            }

            foreach (var quoteCurrency in quoteCurrencies)
            {
                if (rates.TryGetProperty(quoteCurrency, out var rateElement) &&
                    rateElement.ValueKind == JsonValueKind.Number &&
                    rateElement.TryGetDecimal(out var rate))
                {
                    result[quoteCurrency] = rate;
                }
            }

            _logger.LogInformation(
                "Successfully fetched {Count} FX rates for {Base}",
                result.Count, baseCurrency);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error fetching multiple FX rates for {Base} from ExchangeRate-API",
                baseCurrency);
            return result;
        }
    }

    public async Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            // Try to fetch a simple rate to check availability
            var response = await _httpClient.GetAsync("/GBP", cancellationToken);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking ExchangeRate-API availability");
            return false;
        }
    }

    private async Task EnforceRateLimitAsync(CancellationToken cancellationToken)
    {
        await _rateLimiter.WaitAsync(cancellationToken);
        try
        {
            // Simple rate limiting: ensure minimum 2 seconds between requests
            // This is conservative for the free tier
            var timeSinceLastRequest = DateTime.UtcNow - _lastRequestTime;
            var minimumDelay = TimeSpan.FromSeconds(2);

            if (timeSinceLastRequest < minimumDelay)
            {
                var delay = minimumDelay - timeSinceLastRequest;
                _logger.LogDebug("Rate limiting: waiting {Delay}ms", delay.TotalMilliseconds);
                await Task.Delay(delay, cancellationToken);
            }

            _lastRequestTime = DateTime.UtcNow;
        }
        finally
        {
            _rateLimiter.Release();
        }
    }
}
