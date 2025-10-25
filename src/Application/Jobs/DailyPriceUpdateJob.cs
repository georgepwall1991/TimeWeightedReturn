using Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace Application.Jobs;

public class DailyPriceUpdateJob
{
    private readonly IPriceUpdateService _priceUpdateService;
    private readonly IFxRateUpdateService _fxRateUpdateService;
    private readonly ILogger<DailyPriceUpdateJob> _logger;

    public DailyPriceUpdateJob(
        IPriceUpdateService priceUpdateService,
        IFxRateUpdateService fxRateUpdateService,
        ILogger<DailyPriceUpdateJob> logger)
    {
        _priceUpdateService = priceUpdateService;
        _fxRateUpdateService = fxRateUpdateService;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        _logger.LogInformation("Starting daily data update job (prices, FX rates, and benchmarks)");

        try
        {
            // Fetch data for yesterday (most recent trading day data available)
            var targetDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

            // 1. Update instrument prices
            _logger.LogInformation("Updating instrument prices for {Date}...", targetDate);
            var priceResult = await _priceUpdateService.RefreshAllPricesAsync(targetDate);
            _logger.LogInformation(
                "Instrument prices updated. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
                priceResult.TotalInstruments,
                priceResult.UpdatedInstruments,
                priceResult.FailedInstruments);

            if (priceResult.Errors.Any())
            {
                _logger.LogWarning("Errors occurred during instrument price update:");
                foreach (var (ticker, error) in priceResult.Errors)
                {
                    _logger.LogWarning("  {Ticker}: {Error}", ticker, error);
                }
            }

            // 2. Update benchmark prices
            _logger.LogInformation("Updating benchmark prices for {Date}...", targetDate);
            var benchmarkResult = await _priceUpdateService.RefreshAllBenchmarkPricesAsync(targetDate);
            _logger.LogInformation(
                "Benchmark prices updated. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
                benchmarkResult.TotalInstruments,
                benchmarkResult.UpdatedInstruments,
                benchmarkResult.FailedInstruments);

            if (benchmarkResult.Errors.Any())
            {
                _logger.LogWarning("Errors occurred during benchmark price update:");
                foreach (var (symbol, error) in benchmarkResult.Errors)
                {
                    _logger.LogWarning("  {Symbol}: {Error}", symbol, error);
                }
            }

            // 3. Update FX rates
            _logger.LogInformation("Updating FX rates for {Date}...", targetDate);
            var fxRateResult = await _fxRateUpdateService.RefreshAllFxRatesAsync(targetDate);
            _logger.LogInformation(
                "FX rates updated. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
                fxRateResult.TotalPairs,
                fxRateResult.UpdatedPairs,
                fxRateResult.FailedPairs);

            if (fxRateResult.Errors.Any())
            {
                _logger.LogWarning("Errors occurred during FX rate update:");
                foreach (var (pair, error) in fxRateResult.Errors)
                {
                    _logger.LogWarning("  {Pair}: {Error}", pair, error);
                }
            }

            _logger.LogInformation("Daily data update job completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing daily data update job");
            throw; // Hangfire will handle retries
        }
    }
}
