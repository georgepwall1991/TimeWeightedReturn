using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Application.Services.MarketData;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.MarketData;

public class PriceUpdateService : IPriceUpdateService
{
    private readonly PortfolioContext _context;
    private readonly IMarketDataService _marketDataService;
    private readonly ILogger<PriceUpdateService> _logger;

    public PriceUpdateService(
        PortfolioContext context,
        IMarketDataService marketDataService,
        ILogger<PriceUpdateService> logger)
    {
        _context = context;
        _marketDataService = marketDataService;
        _logger = logger;
    }

    public async Task<MarketDataStatus> RefreshAllPricesAsync(
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)); // Default to yesterday
        var startTime = DateTime.UtcNow;

        _logger.LogInformation("Starting price refresh for all instruments on {Date}", targetDate);

        // Get all security instruments (not cash)
        var instruments = await _context.Instruments
            .Where(i => i.Type == InstrumentType.Security)
            .ToListAsync(cancellationToken);

        var totalInstruments = instruments.Count;
        var updatedInstruments = 0;
        var failedInstruments = 0;
        var errors = new Dictionary<string, string>();

        foreach (var instrument in instruments)
        {
            try
            {
                var success = await RefreshInstrumentPriceInternalAsync(
                    instrument,
                    targetDate,
                    cancellationToken);

                if (success)
                {
                    updatedInstruments++;
                }
                else
                {
                    failedInstruments++;
                    errors[instrument.Ticker] = "No price data available";
                }
            }
            catch (Exception ex)
            {
                failedInstruments++;
                errors[instrument.Ticker] = ex.Message;
                _logger.LogError(ex, "Failed to refresh price for {Ticker}", instrument.Ticker);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Completed price refresh. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
            totalInstruments, updatedInstruments, failedInstruments);

        // Get provider status
        var providerStatus = await _marketDataService.GetProviderStatusAsync(cancellationToken);
        var primaryProvider = providerStatus.FirstOrDefault(p => p.Value).Key;

        return new MarketDataStatus(
            primaryProvider,
            providerStatus.Any(p => p.Value),
            startTime,
            totalInstruments,
            updatedInstruments,
            failedInstruments,
            errors);
    }

    public async Task<bool> RefreshInstrumentPriceAsync(
        Guid instrumentId,
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var instrument = await _context.Instruments
            .FirstOrDefaultAsync(i => i.Id == instrumentId, cancellationToken);

        if (instrument == null)
        {
            _logger.LogWarning("Instrument {InstrumentId} not found", instrumentId);
            return false;
        }

        if (instrument.Type == InstrumentType.Cash)
        {
            _logger.LogInformation("Skipping cash instrument {Ticker}", instrument.Ticker);
            return false;
        }

        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var success = await RefreshInstrumentPriceInternalAsync(instrument, targetDate, cancellationToken);

        if (success)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return success;
    }

    public async Task<IEnumerable<InstrumentPriceStatus>> GetInstrumentPriceStatusAsync(
        CancellationToken cancellationToken = default)
    {
        var instruments = await _context.Instruments
            .Where(i => i.Type == InstrumentType.Security)
            .Include(i => i.Prices)
            .ToListAsync(cancellationToken);

        var statusList = new List<InstrumentPriceStatus>();

        foreach (var instrument in instruments)
        {
            var lastPrice = instrument.Prices
                .OrderByDescending(p => p.Date)
                .FirstOrDefault();

            var needsUpdate = lastPrice == null ||
                              lastPrice.Date < DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

            statusList.Add(new InstrumentPriceStatus(
                instrument.Id,
                instrument.Ticker,
                instrument.Name,
                lastPrice?.Date.ToDateTime(TimeOnly.MinValue),
                lastPrice?.Source,
                needsUpdate));
        }

        return statusList;
    }

    private async Task<bool> RefreshInstrumentPriceInternalAsync(
        Instrument instrument,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Refreshing price for {Ticker} on {Date}", instrument.Ticker, date);

        // Check if price already exists
        var existingPrice = await _context.Prices
            .FirstOrDefaultAsync(
                p => p.InstrumentId == instrument.Id && p.Date == date,
                cancellationToken);

        // Skip if price exists and is from manual source (preserve manual entries)
        if (existingPrice != null && existingPrice.Source == PriceSource.Manual)
        {
            _logger.LogInformation(
                "Skipping {Ticker} on {Date} - manual price exists",
                instrument.Ticker, date);
            return true;
        }

        // Fetch price from market data service
        var marketPrice = await _marketDataService.GetPriceAsync(
            instrument.Ticker,
            date,
            cancellationToken: cancellationToken);

        if (marketPrice == null)
        {
            _logger.LogWarning("No market data found for {Ticker} on {Date}", instrument.Ticker, date);
            return false;
        }

        if (existingPrice != null)
        {
            // Update existing API-sourced price
            existingPrice.Value = marketPrice.Price;
            existingPrice.Source = marketPrice.Source;
            existingPrice.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "Updated price for {Ticker} on {Date}: {Price} ({Source})",
                instrument.Ticker, date, marketPrice.Price, marketPrice.Source);
        }
        else
        {
            // Create new price entry
            var newPrice = new Price
            {
                Id = Guid.NewGuid(),
                InstrumentId = instrument.Id,
                Date = date,
                Value = marketPrice.Price,
                Source = marketPrice.Source,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Prices.Add(newPrice);

            _logger.LogInformation(
                "Created price for {Ticker} on {Date}: {Price} ({Source})",
                instrument.Ticker, date, marketPrice.Price, marketPrice.Source);
        }

        return true;
    }

    public async Task<MarketDataStatus> RefreshAllBenchmarkPricesAsync(
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)); // Default to yesterday
        var startTime = DateTime.UtcNow;

        _logger.LogInformation("Starting benchmark price refresh for all benchmarks on {Date}", targetDate);

        // Get all active benchmarks
        var benchmarks = await _context.Benchmarks
            .Where(b => b.IsActive)
            .ToListAsync(cancellationToken);

        var totalBenchmarks = benchmarks.Count;
        var updatedBenchmarks = 0;
        var failedBenchmarks = 0;
        var errors = new Dictionary<string, string>();

        foreach (var benchmark in benchmarks)
        {
            try
            {
                var success = await RefreshBenchmarkPriceInternalAsync(
                    benchmark,
                    targetDate,
                    cancellationToken);

                if (success)
                {
                    updatedBenchmarks++;
                }
                else
                {
                    failedBenchmarks++;
                    errors[benchmark.IndexSymbol] = "No price data available";
                }
            }
            catch (Exception ex)
            {
                failedBenchmarks++;
                errors[benchmark.IndexSymbol] = ex.Message;
                _logger.LogError(ex, "Failed to refresh price for benchmark {Symbol}", benchmark.IndexSymbol);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Completed benchmark price refresh. Total: {Total}, Updated: {Updated}, Failed: {Failed}",
            totalBenchmarks, updatedBenchmarks, failedBenchmarks);

        // Get provider status
        var providerStatus = await _marketDataService.GetProviderStatusAsync(cancellationToken);
        var primaryProvider = providerStatus.FirstOrDefault(p => p.Value).Key;

        return new MarketDataStatus(
            primaryProvider,
            providerStatus.Any(p => p.Value),
            startTime,
            totalBenchmarks,
            updatedBenchmarks,
            failedBenchmarks,
            errors);
    }

    public async Task<bool> RefreshBenchmarkPriceAsync(
        Guid benchmarkId,
        DateOnly? date = null,
        CancellationToken cancellationToken = default)
    {
        var benchmark = await _context.Benchmarks
            .FirstOrDefaultAsync(b => b.Id == benchmarkId, cancellationToken);

        if (benchmark == null)
        {
            _logger.LogWarning("Benchmark {BenchmarkId} not found", benchmarkId);
            return false;
        }

        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        var success = await RefreshBenchmarkPriceInternalAsync(benchmark, targetDate, cancellationToken);

        if (success)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        return success;
    }

    public async Task<IEnumerable<BenchmarkPriceStatus>> GetBenchmarkPriceStatusAsync(
        CancellationToken cancellationToken = default)
    {
        var benchmarks = await _context.Benchmarks
            .Where(b => b.IsActive)
            .Include(b => b.Prices)
            .ToListAsync(cancellationToken);

        var statusList = new List<BenchmarkPriceStatus>();

        foreach (var benchmark in benchmarks)
        {
            var lastPrice = benchmark.Prices
                .OrderByDescending(p => p.Date)
                .FirstOrDefault();

            var needsUpdate = lastPrice == null ||
                              lastPrice.Date < DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));

            statusList.Add(new BenchmarkPriceStatus(
                benchmark.Id,
                benchmark.IndexSymbol,
                benchmark.Name,
                lastPrice?.Date.ToDateTime(TimeOnly.MinValue),
                needsUpdate));
        }

        return statusList;
    }

    private async Task<bool> RefreshBenchmarkPriceInternalAsync(
        Domain.Entities.Benchmark benchmark,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Refreshing price for benchmark {Symbol} on {Date}", benchmark.IndexSymbol, date);

        // Check if price already exists
        var existingPrice = await _context.BenchmarkPrices
            .FirstOrDefaultAsync(
                p => p.BenchmarkId == benchmark.Id && p.Date == date,
                cancellationToken);

        // Fetch price from market data service
        var marketPrice = await _marketDataService.GetPriceAsync(
            benchmark.IndexSymbol,
            date,
            cancellationToken: cancellationToken);

        if (marketPrice == null)
        {
            _logger.LogWarning("No market data found for benchmark {Symbol} on {Date}", benchmark.IndexSymbol, date);
            return false;
        }

        if (existingPrice != null)
        {
            // Update existing price
            existingPrice.Value = marketPrice.Price;
            existingPrice.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation(
                "Updated price for benchmark {Symbol} on {Date}: {Price}",
                benchmark.IndexSymbol, date, marketPrice.Price);
        }
        else
        {
            // Create new price entry
            var newPrice = new Domain.Entities.BenchmarkPrice
            {
                Id = Guid.NewGuid(),
                BenchmarkId = benchmark.Id,
                Date = date,
                Value = marketPrice.Price,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BenchmarkPrices.Add(newPrice);

            _logger.LogInformation(
                "Created price for benchmark {Symbol} on {Date}: {Price}",
                benchmark.IndexSymbol, date, marketPrice.Price);
        }

        return true;
    }
}
