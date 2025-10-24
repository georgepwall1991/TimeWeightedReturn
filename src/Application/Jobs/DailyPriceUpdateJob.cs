using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Application.Jobs;

public class DailyPriceUpdateJob
{
    private readonly IPriceUpdateService _priceUpdateService;
    private readonly ILogger<DailyPriceUpdateJob> _logger;

    public DailyPriceUpdateJob(
        IPriceUpdateService priceUpdateService,
        ILogger<DailyPriceUpdateJob> logger)
    {
        _priceUpdateService = priceUpdateService;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily price update job");

        try
        {
            // Fetch prices for yesterday (most recent trading day data available)
            var targetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

            var result = await _priceUpdateService.RefreshAllPricesAsync(targetDate);

            _logger.LogInformation(
                "Daily price update job completed. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
                result.TotalInstruments,
                result.UpdatedInstruments,
                result.FailedInstruments);

            if (result.Errors.Any())
            {
                _logger.LogWarning("Errors occurred during price update:");
                foreach (var (ticker, error) in result.Errors)
                {
                    _logger.LogWarning("  {Ticker}: {Error}", ticker, error);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing daily price update job");
            throw; // Hangfire will handle retries
        }
    }
}
