using Application.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Initialization;

/// <summary>
/// Service that ensures FX rates are available for all currencies in use.
/// Runs on application startup to prevent currency conversion errors.
/// </summary>
public class FxRateInitializationService
{
    private readonly PortfolioContext _context;
    private readonly IFxRateUpdateService _fxRateUpdateService;
    private readonly ILogger<FxRateInitializationService> _logger;

    public FxRateInitializationService(
        PortfolioContext context,
        IFxRateUpdateService fxRateUpdateService,
        ILogger<FxRateInitializationService> logger)
    {
        _context = context;
        _fxRateUpdateService = fxRateUpdateService;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting FX rate initialization check...");

        try
        {
            // Get all unique currencies used in the system
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
                .Where(c => c != "GBP") // GBP is our base currency, no rate needed
                .Distinct()
                .ToList();

            if (!allCurrencies.Any())
            {
                _logger.LogInformation("No non-GBP currencies found. FX rate initialization not needed.");
                return;
            }

            _logger.LogInformation("Found {Count} currencies in use: {Currencies}",
                allCurrencies.Count, string.Join(", ", allCurrencies));

            // Check which currencies are missing FX rates for today
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var yesterday = today.AddDays(-1);

            var missingCurrencies = new List<string>();

            foreach (var currency in allCurrencies)
            {
                // Check if we have a recent FX rate (today or yesterday)
                var hasRecentRate = await _context.FxRates
                    .AnyAsync(r =>
                        r.BaseCurrency == "GBP" &&
                        r.QuoteCurrency == currency &&
                        (r.Date == today || r.Date == yesterday),
                        cancellationToken);

                if (!hasRecentRate)
                {
                    missingCurrencies.Add(currency);
                }
            }

            if (!missingCurrencies.Any())
            {
                _logger.LogInformation("All required FX rates are up to date.");
                return;
            }

            _logger.LogWarning("Missing FX rates for {Count} currencies: {Currencies}. Fetching now...",
                missingCurrencies.Count, string.Join(", ", missingCurrencies));

            // Fetch missing FX rates
            foreach (var currency in missingCurrencies)
            {
                try
                {
                    _logger.LogInformation("Fetching FX rate for GBP/{Currency}...", currency);

                    var success = await _fxRateUpdateService.RefreshFxRateAsync(
                        "GBP",
                        currency,
                        yesterday, // Use yesterday as today's rates might not be available yet
                        cancellationToken);

                    if (success)
                    {
                        _logger.LogInformation("Successfully fetched FX rate for GBP/{Currency}", currency);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to fetch FX rate for GBP/{Currency}. Will retry on next startup.", currency);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error fetching FX rate for GBP/{Currency}", currency);
                }
            }

            _logger.LogInformation("FX rate initialization completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during FX rate initialization");
            // Don't throw - we don't want to prevent app startup if FX rate fetch fails
            // The data health system will report this issue
        }
    }
}
