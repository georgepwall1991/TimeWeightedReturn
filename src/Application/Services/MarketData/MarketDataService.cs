using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Application.Services.MarketData;

public interface IMarketDataService
{
    Task<MarketDataPrice?> GetPriceAsync(
        string ticker,
        DateOnly date,
        PriceSource? preferredProvider = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<MarketDataPrice>> GetPricesAsync(
        string ticker,
        DateOnly startDate,
        DateOnly endDate,
        PriceSource? preferredProvider = null,
        CancellationToken cancellationToken = default);

    Task<bool> ValidateTickerAsync(
        string ticker,
        CancellationToken cancellationToken = default);

    Task<Dictionary<PriceSource, bool>> GetProviderStatusAsync(
        CancellationToken cancellationToken = default);
}

public class MarketDataService : IMarketDataService
{
    private readonly IEnumerable<IMarketDataProvider> _providers;
    private readonly MarketDataSettings _settings;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MarketDataService> _logger;

    public MarketDataService(
        IEnumerable<IMarketDataProvider> providers,
        IOptions<MarketDataSettings> settings,
        IMemoryCache cache,
        ILogger<MarketDataService> logger)
    {
        _providers = providers;
        _settings = settings.Value;
        _cache = cache;
        _logger = logger;
    }

    public async Task<MarketDataPrice?> GetPriceAsync(
        string ticker,
        DateOnly date,
        PriceSource? preferredProvider = null,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"price_{ticker}_{date}_{preferredProvider}";

        if (_cache.TryGetValue<MarketDataPrice>(cacheKey, out var cachedPrice))
        {
            _logger.LogDebug("Cache hit for {Ticker} on {Date}", ticker, date);
            return cachedPrice;
        }

        var providersToTry = GetProvidersInOrder(preferredProvider);

        foreach (var provider in providersToTry)
        {
            try
            {
                _logger.LogInformation("Trying provider {Provider} for {Ticker} on {Date}",
                    provider.ProviderType, ticker, date);

                var price = await provider.GetPriceAsync(ticker, date, cancellationToken);

                if (price != null)
                {
                    _logger.LogInformation("Successfully fetched price for {Ticker} on {Date} from {Provider}",
                        ticker, date, provider.ProviderType);

                    // Cache the result
                    _cache.Set(cacheKey, price, TimeSpan.FromMinutes(_settings.CacheDurationMinutes));

                    return price;
                }

                _logger.LogWarning("Provider {Provider} returned no data for {Ticker} on {Date}",
                    provider.ProviderType, ticker, date);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using provider {Provider} for {Ticker} on {Date}",
                    provider.ProviderType, ticker, date);
            }
        }

        _logger.LogWarning("Failed to fetch price for {Ticker} on {Date} from all providers", ticker, date);
        return null;
    }

    public async Task<IEnumerable<MarketDataPrice>> GetPricesAsync(
        string ticker,
        DateOnly startDate,
        DateOnly endDate,
        PriceSource? preferredProvider = null,
        CancellationToken cancellationToken = default)
    {
        var cacheKey = $"prices_{ticker}_{startDate}_{endDate}_{preferredProvider}";

        if (_cache.TryGetValue<IEnumerable<MarketDataPrice>>(cacheKey, out var cachedPrices))
        {
            _logger.LogDebug("Cache hit for {Ticker} from {StartDate} to {EndDate}", ticker, startDate, endDate);
            return cachedPrices ?? Enumerable.Empty<MarketDataPrice>();
        }

        var providersToTry = GetProvidersInOrder(preferredProvider);

        foreach (var provider in providersToTry)
        {
            try
            {
                _logger.LogInformation("Trying provider {Provider} for {Ticker} from {StartDate} to {EndDate}",
                    provider.ProviderType, ticker, startDate, endDate);

                var prices = await provider.GetPricesAsync(ticker, startDate, endDate, cancellationToken);
                var priceList = prices.ToList();

                if (priceList.Any())
                {
                    _logger.LogInformation("Successfully fetched {Count} prices for {Ticker} from {Provider}",
                        priceList.Count, ticker, provider.ProviderType);

                    // Cache the result
                    _cache.Set(cacheKey, priceList, TimeSpan.FromMinutes(_settings.CacheDurationMinutes));

                    return priceList;
                }

                _logger.LogWarning("Provider {Provider} returned no data for {Ticker}", provider.ProviderType, ticker);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error using provider {Provider} for {Ticker}",
                    provider.ProviderType, ticker);
            }
        }

        _logger.LogWarning("Failed to fetch prices for {Ticker} from {StartDate} to {EndDate} from all providers",
            ticker, startDate, endDate);
        return Enumerable.Empty<MarketDataPrice>();
    }

    public async Task<bool> ValidateTickerAsync(string ticker, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"validate_{ticker}";

        if (_cache.TryGetValue<bool>(cacheKey, out var cachedResult))
        {
            return cachedResult;
        }

        // Try all providers until one succeeds
        foreach (var provider in _providers)
        {
            try
            {
                var isValid = await provider.ValidateTickerAsync(ticker, cancellationToken);
                if (isValid)
                {
                    _cache.Set(cacheKey, true, TimeSpan.FromHours(24));
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating ticker {Ticker} with provider {Provider}",
                    ticker, provider.ProviderType);
            }
        }

        _cache.Set(cacheKey, false, TimeSpan.FromHours(1));
        return false;
    }

    public async Task<Dictionary<PriceSource, bool>> GetProviderStatusAsync(CancellationToken cancellationToken = default)
    {
        var status = new Dictionary<PriceSource, bool>();

        var tasks = _providers.Select(async provider =>
        {
            try
            {
                var isAvailable = await provider.IsAvailableAsync(cancellationToken);
                return (provider.ProviderType, isAvailable);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking availability of provider {Provider}", provider.ProviderType);
                return (provider.ProviderType, false);
            }
        });

        var results = await Task.WhenAll(tasks);

        foreach (var (providerType, isAvailable) in results)
        {
            status[providerType] = isAvailable;
        }

        return status;
    }

    private IEnumerable<IMarketDataProvider> GetProvidersInOrder(PriceSource? preferredProvider)
    {
        var providersList = _providers.ToList();

        if (preferredProvider.HasValue)
        {
            // Try preferred provider first
            var preferred = providersList.FirstOrDefault(p => p.ProviderType == preferredProvider.Value);
            if (preferred != null)
            {
                yield return preferred;
            }
        }
        else
        {
            // Try default provider first
            var defaultProvider = providersList.FirstOrDefault(p => p.ProviderType == _settings.DefaultProvider);
            if (defaultProvider != null)
            {
                yield return defaultProvider;
            }
        }

        // Try fallback providers in order
        foreach (var fallbackType in _settings.FallbackProviders)
        {
            var fallback = providersList.FirstOrDefault(p => p.ProviderType == fallbackType);
            if (fallback != null && fallback.ProviderType != preferredProvider)
            {
                yield return fallback;
            }
        }

        // Try any remaining providers
        foreach (var provider in providersList)
        {
            if (provider.ProviderType != preferredProvider &&
                provider.ProviderType != _settings.DefaultProvider &&
                !_settings.FallbackProviders.Contains(provider.ProviderType))
            {
                yield return provider;
            }
        }
    }
}
