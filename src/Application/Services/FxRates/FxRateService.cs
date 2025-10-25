using Application.Interfaces;
using Application.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Services.FxRates;

public interface IFxRateService
{
    Task<decimal?> GetFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<Dictionary<string, decimal>> GetMultipleFxRatesAsync(
        string baseCurrency,
        IEnumerable<string> quoteCurrencies,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<Dictionary<string, bool>> GetProviderStatusAsync(
        CancellationToken cancellationToken = default);
}

public class FxRateService : IFxRateService
{
    private readonly IEnumerable<IFxRateProvider> _providers;
    private readonly FxRateSettings _settings;
    private readonly IMemoryCache _cache;
    private readonly ILogger<FxRateService> _logger;

    public FxRateService(
        IEnumerable<IFxRateProvider> providers,
        IOptions<FxRateSettings> settings,
        IMemoryCache cache,
        ILogger<FxRateService> logger)
    {
        _providers = providers;
        _settings = settings.Value;
        _cache = cache;
        _logger = logger;
    }

    public async Task<decimal?> GetFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"fxrate_{baseCurrency}_{quoteCurrency}_{date}";

        if (_cache.TryGetValue<decimal>(cacheKey, out var cachedRate))
        {
            _logger.LogDebug("Cache hit for {Base}/{Quote} on {Date}", baseCurrency, quoteCurrency, date);
            return cachedRate;
        }

        var providersToTry = GetProvidersInOrder();

        foreach (var provider in providersToTry)
        {
            try
            {
                _logger.LogInformation("Trying provider {Provider} for {Base}/{Quote} on {Date}",
                    provider.ProviderName, baseCurrency, quoteCurrency, date);

                var rate = await provider.GetFxRateAsync(baseCurrency, quoteCurrency, date, cancellationToken);

                if (rate.HasValue)
                {
                    _logger.LogInformation("Successfully fetched FX rate for {Base}/{Quote} on {Date} from {Provider}: {Rate}",
                        baseCurrency, quoteCurrency, date, provider.ProviderName, rate.Value);

                    // Cache the result
                    _cache.Set(cacheKey, rate.Value, TimeSpan.FromMinutes(_settings.CacheDurationMinutes));

                    return rate.Value;
                }

                _logger.LogWarning("Provider {Provider} returned no data for {Base}/{Quote} on {Date}",
                    provider.ProviderName, baseCurrency, quoteCurrency, date);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using provider {Provider} for {Base}/{Quote} on {Date}",
                    provider.ProviderName, baseCurrency, quoteCurrency, date);
            }
        }

        _logger.LogWarning("Failed to fetch FX rate for {Base}/{Quote} on {Date} from all providers",
            baseCurrency, quoteCurrency, date);
        return null;
    }

    public async Task<Dictionary<string, decimal>> GetMultipleFxRatesAsync(
        string baseCurrency,
        IEnumerable<string> quoteCurrencies,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var result = new Dictionary<string, decimal>();
        var quoteCurrencyList = quoteCurrencies.ToList();

        var cacheKey = $"fxrates_{baseCurrency}_{string.Join(",", quoteCurrencyList)}_{date}";

        if (_cache.TryGetValue<Dictionary<string, decimal>>(cacheKey, out var cachedRates))
        {
            _logger.LogDebug("Cache hit for multiple FX rates for {Base} on {Date}", baseCurrency, date);
            return cachedRates ?? new Dictionary<string, decimal>();
        }

        var providersToTry = GetProvidersInOrder();

        foreach (var provider in providersToTry)
        {
            try
            {
                _logger.LogInformation("Trying provider {Provider} for multiple FX rates for {Base} on {Date}",
                    provider.ProviderName, baseCurrency, date);

                var rates = await provider.GetMultipleFxRatesAsync(baseCurrency, quoteCurrencyList, date, cancellationToken);

                if (rates.Any())
                {
                    _logger.LogInformation("Successfully fetched {Count} FX rates for {Base} from {Provider}",
                        rates.Count, baseCurrency, provider.ProviderName);

                    // Cache the result
                    _cache.Set(cacheKey, rates, TimeSpan.FromMinutes(_settings.CacheDurationMinutes));

                    return rates;
                }

                _logger.LogWarning("Provider {Provider} returned no data for {Base}", provider.ProviderName, baseCurrency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using provider {Provider} for {Base}",
                    provider.ProviderName, baseCurrency);
            }
        }

        _logger.LogWarning("Failed to fetch multiple FX rates for {Base} on {Date} from all providers",
            baseCurrency, date);
        return result;
    }

    public async Task<Dictionary<string, bool>> GetProviderStatusAsync(CancellationToken cancellationToken = default)
    {
        var status = new Dictionary<string, bool>();

        foreach (var provider in _providers)
        {
            try
            {
                var isAvailable = await provider.IsAvailableAsync(cancellationToken);
                status[provider.ProviderName] = isAvailable;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking availability of provider {Provider}", provider.ProviderName);
                status[provider.ProviderName] = false;
            }
        }

        return status;
    }

    private IEnumerable<IFxRateProvider> GetProvidersInOrder()
    {
        var providers = new List<IFxRateProvider>();

        // Add default provider first
        var defaultProvider = _providers.FirstOrDefault(p => p.ProviderName == _settings.DefaultProvider);
        if (defaultProvider != null)
        {
            providers.Add(defaultProvider);
        }

        // Add fallback providers
        foreach (var fallbackName in _settings.FallbackProviders)
        {
            var fallbackProvider = _providers.FirstOrDefault(p => p.ProviderName == fallbackName);
            if (fallbackProvider != null && !providers.Contains(fallbackProvider))
            {
                providers.Add(fallbackProvider);
            }
        }

        // Add any remaining providers
        foreach (var provider in _providers.Where(p => !providers.Contains(p)))
        {
            providers.Add(provider);
        }

        return providers;
    }
}
