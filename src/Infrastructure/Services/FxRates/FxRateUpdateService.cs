using Application.Features.FxRates.DTOs;
using Application.Interfaces;
using Application.Services.FxRates;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.FxRates;

public class FxRateUpdateService : IFxRateUpdateService
{
    private readonly PortfolioContext _context;
    private readonly IFxRateService _fxRateService;
    private readonly ILogger<FxRateUpdateService> _logger;

    public FxRateUpdateService(
        PortfolioContext context,
        IFxRateService fxRateService,
        ILogger<FxRateUpdateService> logger)
    {
        _context = context;
        _fxRateService = fxRateService;
        _logger = logger;
    }

    public async Task<FxRateUpdateStatus> RefreshAllFxRatesAsync(
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)); // Default to yesterday
        var startTime = DateTime.UtcNow;

        _logger.LogInformation("Starting FX rate refresh for all currency pairs on {Date}", targetDate);

        // Get all unique currencies used in the system (from accounts and instruments)
        var accountCurrencies = await _context.Accounts
            .Select(a => a.Currency)
            .Distinct()
            .ToListAsync(cancellationToken);

        var instrumentCurrencies = await _context.Instruments
            .Select(i => i.Currency)
            .Distinct()
            .ToListAsync(cancellationToken);

        var allCurrencies = accountCurrencies
            .Union(instrumentCurrencies)
            .Where(c => c != "GBP") // GBP is our base currency
            .Distinct()
            .ToList();

        var totalPairs = allCurrencies.Count;
        var updatedPairs = 0;
        var failedPairs = 0;
        var errors = new Dictionary<string, string>();

        // Refresh rates for each currency against GBP (base currency)
        foreach (var currency in allCurrencies)
        {
            try
            {
                var success = await RefreshFxRateInternalAsync(
                    "GBP",
                    currency,
                    targetDate,
                    cancellationToken);

                if (success)
                {
                    updatedPairs++;
                }
                else
                {
                    failedPairs++;
                    errors[$"GBP/{currency}"] = "No FX rate data available";
                }
            }
            catch (Exception ex)
            {
                failedPairs++;
                errors[$"GBP/{currency}"] = ex.Message;
                _logger.LogError(ex, "Failed to refresh FX rate for GBP/{Currency}", currency);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Completed FX rate refresh. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
            totalPairs, updatedPairs, failedPairs);

        // Get provider status
        var providerStatus = await _fxRateService.GetProviderStatusAsync(cancellationToken);
        var primaryProvider = providerStatus.FirstOrDefault(p => p.Value).Key ?? "None";

        return new FxRateUpdateStatus(
            primaryProvider,
            providerStatus.Any(p => p.Value),
            startTime,
            totalPairs,
            updatedPairs,
            failedPairs,
            errors);
    }

    public async Task<bool> RefreshFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var success = await RefreshFxRateInternalAsync(baseCurrency, quoteCurrency, targetDate, cancellationToken);

        if (success)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return success;
    }

    public async Task<IEnumerable<CurrencyPairStatus>> GetFxRateStatusAsync(
        CancellationToken cancellationToken = default)
    {
        var statusList = new List<CurrencyPairStatus>();

        // Get all FX rates from the database
        var fxRates = await _context.FxRates
            .GroupBy(r => new { r.BaseCurrency, r.QuoteCurrency })
            .Select(g => new
            {
                g.Key.BaseCurrency,
                g.Key.QuoteCurrency,
                LastUpdate = g.Max(r => r.UpdatedAt)
            })
            .ToListAsync(cancellationToken);

        foreach (var rate in fxRates)
        {
            var needsUpdate = rate.LastUpdate < DateTime.UtcNow.AddDays(-1);

            statusList.Add(new CurrencyPairStatus(
                rate.BaseCurrency,
                rate.QuoteCurrency,
                rate.LastUpdate,
                needsUpdate));
        }

        return statusList;
    }

    private async Task<bool> RefreshFxRateInternalAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Refreshing FX rate for {Base}/{Quote} on {Date}",
            baseCurrency, quoteCurrency, date);

        // Check if rate already exists
        var existingRate = await _context.FxRates
            .FirstOrDefaultAsync(
                r => r.BaseCurrency == baseCurrency &&
                     r.QuoteCurrency == quoteCurrency &&
                     r.Date == date,
                cancellationToken);

        // Fetch rate from FX rate service
        var fetchedRate = await _fxRateService.GetFxRateAsync(
            baseCurrency,
            quoteCurrency,
            date,
            cancellationToken);

        if (!fetchedRate.HasValue)
        {
            _logger.LogWarning("No FX rate data found for {Base}/{Quote} on {Date}",
                baseCurrency, quoteCurrency, date);
            return false;
        }

        if (existingRate != null)
        {
            // Update existing rate
            existingRate.Rate = fetchedRate.Value;
            existingRate.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "Updated FX rate for {Base}/{Quote} on {Date}: {Rate}",
                baseCurrency, quoteCurrency, date, fetchedRate.Value);
        }
        else
        {
            // Create new rate entry
            var newRate = new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = baseCurrency,
                QuoteCurrency = quoteCurrency,
                Date = date,
                Rate = fetchedRate.Value,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.FxRates.Add(newRate);

            _logger.LogInformation(
                "Created FX rate for {Base}/{Quote} on {Date}: {Rate}",
                baseCurrency, quoteCurrency, date, fetchedRate.Value);
        }

        return true;
    }
}
