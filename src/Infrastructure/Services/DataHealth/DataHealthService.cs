using Application.Features.DataHealth.DTOs;
using Application.Interfaces;
using Application.Services;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services.DataHealth;

public class DataHealthService : IDataHealthService
{
    private readonly PortfolioContext _context;
    private readonly DataFreshnessSettings _settings;
    private readonly ILogger<DataHealthService> _logger;

    public DataHealthService(
        PortfolioContext context,
        IOptions<DataFreshnessSettings> settings,
        ILogger<DataHealthService> logger)
    {
        _context = context;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<DataHealthSummary> GetOverallHealthAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Calculating overall data health");

        var priceHealth = await GetPriceHealthAsync(cancellationToken);
        var fxRateHealth = await GetFxRateHealthAsync(cancellationToken);
        var benchmarkHealth = await GetBenchmarkHealthAsync(cancellationToken);
        var holdingHealth = await GetHoldingHealthAsync(cancellationToken);

        var totalCritical = new[] { priceHealth, fxRateHealth, benchmarkHealth, holdingHealth }
            .Count(h => h.Severity == HealthSeverity.Critical);

        var totalWarnings = new[] { priceHealth, fxRateHealth, benchmarkHealth, holdingHealth }
            .Count(h => h.Severity == HealthSeverity.Warning);

        var overallSeverity = totalCritical > 0 ? HealthSeverity.Critical :
                            totalWarnings > 0 ? HealthSeverity.Warning :
                            HealthSeverity.OK;

        return new DataHealthSummary(
            overallSeverity,
            totalCritical + totalWarnings,
            totalCritical,
            totalWarnings,
            DateTime.UtcNow,
            priceHealth,
            fxRateHealth,
            benchmarkHealth,
            holdingHealth);
    }

    public async Task<IEnumerable<DataHealthDetail>> GetPortfolioHealthDetailsAsync(
        Guid portfolioId,
        CancellationToken cancellationToken = default)
    {
        var details = new List<DataHealthDetail>();

        // Get all accounts in the portfolio
        var accounts = await _context.Accounts
            .Where(a => a.PortfolioId == portfolioId)
            .ToListAsync(cancellationToken);

        foreach (var account in accounts)
        {
            var accountDetails = await GetAccountHealthDetailsAsync(account.Id, cancellationToken);
            details.AddRange(accountDetails);
        }

        return details;
    }

    public async Task<IEnumerable<DataHealthDetail>> GetAccountHealthDetailsAsync(
        Guid accountId,
        CancellationToken cancellationToken = default)
    {
        var details = new List<DataHealthDetail>();

        var account = await _context.Accounts
            .Include(a => a.Holdings)
            .ThenInclude(h => h.Instrument)
            .ThenInclude(i => i.Prices)
            .FirstOrDefaultAsync(a => a.Id == accountId, cancellationToken);

        if (account == null)
        {
            return details;
        }

        // Check holdings staleness (if we track it)
        var latestHolding = account.Holdings.OrderByDescending(h => h.Date).FirstOrDefault();
        if (latestHolding != null)
        {
            var daysSinceHolding = (DateTime.UtcNow - latestHolding.Date.ToDateTime(TimeOnly.MinValue)).Days;
            if (daysSinceHolding > _settings.HoldingStalenessThresholdDays)
            {
                details.Add(new DataHealthDetail(
                    "Holding",
                    account.Id.ToString(),
                    $"Account {account.AccountNumber}",
                    daysSinceHolding > _settings.HoldingStalenessThresholdDays * 2 ? HealthSeverity.Critical : HealthSeverity.Warning,
                    $"Holdings not updated in {daysSinceHolding} days",
                    latestHolding.Date.ToDateTime(TimeOnly.MinValue),
                    daysSinceHolding,
                    "Update holdings for this account"));
            }
        }

        // Check instrument prices for holdings in this account
        var instruments = account.Holdings.Select(h => h.Instrument).Distinct();
        foreach (var instrument in instruments)
        {
            if (instrument.Type == Domain.Entities.InstrumentType.Cash)
                continue;

            var latestPrice = instrument.Prices.OrderByDescending(p => p.Date).FirstOrDefault();
            if (latestPrice == null)
            {
                details.Add(new DataHealthDetail(
                    "Price",
                    instrument.Id.ToString(),
                    instrument.Ticker,
                    HealthSeverity.Critical,
                    "No price data available",
                    null,
                    int.MaxValue,
                    "Fetch price data for this instrument"));
            }
            else
            {
                var daysSincePrice = DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - latestPrice.Date.DayNumber;
                if (daysSincePrice > _settings.PriceStalenessThresholdDays)
                {
                    details.Add(new DataHealthDetail(
                        "Price",
                        instrument.Id.ToString(),
                        instrument.Ticker,
                        daysSincePrice > _settings.PriceStalenessThresholdDays * 2 ? HealthSeverity.Critical : HealthSeverity.Warning,
                        $"Price not updated in {daysSincePrice} days",
                        latestPrice.Date.ToDateTime(TimeOnly.MinValue),
                        daysSincePrice,
                        "Refresh price data for this instrument"));
                }
            }
        }

        return details;
    }

    public async Task<IEnumerable<DataHealthDetail>> GetAllHealthIssuesAsync(
        HealthSeverity? minimumSeverity = null,
        CancellationToken cancellationToken = default)
    {
        var allIssues = new List<DataHealthDetail>();

        // Check all instrument prices
        var instruments = await _context.Instruments
            .Include(i => i.Prices)
            .Where(i => i.Type == Domain.Entities.InstrumentType.Security)
            .ToListAsync(cancellationToken);

        foreach (var instrument in instruments)
        {
            var latestPrice = instrument.Prices.OrderByDescending(p => p.Date).FirstOrDefault();
            if (latestPrice == null)
            {
                allIssues.Add(new DataHealthDetail(
                    "Price",
                    instrument.Id.ToString(),
                    instrument.Ticker,
                    HealthSeverity.Critical,
                    "No price data available",
                    null,
                    int.MaxValue,
                    "Fetch price data for this instrument"));
            }
            else
            {
                var daysSincePrice = DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - latestPrice.Date.DayNumber;
                if (daysSincePrice > _settings.PriceStalenessThresholdDays)
                {
                    allIssues.Add(new DataHealthDetail(
                        "Price",
                        instrument.Id.ToString(),
                        instrument.Ticker,
                        daysSincePrice > _settings.PriceStalenessThresholdDays * 2 ? HealthSeverity.Critical : HealthSeverity.Warning,
                        $"Price not updated in {daysSincePrice} days",
                        latestPrice.UpdatedAt,
                        daysSincePrice,
                        "Refresh price data for this instrument"));
                }
            }
        }

        // Check FX rates
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
            var daysSinceUpdate = (DateTime.UtcNow - rate.LastUpdate).Days;
            if (daysSinceUpdate > _settings.FxRateStalenessThresholdDays)
            {
                allIssues.Add(new DataHealthDetail(
                    "FxRate",
                    $"{rate.BaseCurrency}/{rate.QuoteCurrency}",
                    $"{rate.BaseCurrency}/{rate.QuoteCurrency}",
                    daysSinceUpdate > _settings.FxRateStalenessThresholdDays * 2 ? HealthSeverity.Critical : HealthSeverity.Warning,
                    $"FX rate not updated in {daysSinceUpdate} days",
                    rate.LastUpdate,
                    daysSinceUpdate,
                    "Refresh FX rate data"));
            }
        }

        // Check benchmarks
        var benchmarks = await _context.Benchmarks
            .Include(b => b.Prices)
            .Where(b => b.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var benchmark in benchmarks)
        {
            var latestPrice = benchmark.Prices.OrderByDescending(p => p.Date).FirstOrDefault();
            if (latestPrice == null)
            {
                allIssues.Add(new DataHealthDetail(
                    "Benchmark",
                    benchmark.Id.ToString(),
                    benchmark.Name,
                    HealthSeverity.Critical,
                    "No benchmark price data available",
                    null,
                    int.MaxValue,
                    "Fetch benchmark price data"));
            }
            else
            {
                var daysSincePrice = DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - latestPrice.Date.DayNumber;
                if (daysSincePrice > _settings.BenchmarkStalenessThresholdDays)
                {
                    allIssues.Add(new DataHealthDetail(
                        "Benchmark",
                        benchmark.Id.ToString(),
                        benchmark.Name,
                        daysSincePrice > _settings.BenchmarkStalenessThresholdDays * 2 ? HealthSeverity.Critical : HealthSeverity.Warning,
                        $"Benchmark price not updated in {daysSincePrice} days",
                        latestPrice.UpdatedAt,
                        daysSincePrice,
                        "Refresh benchmark price data"));
                }
            }
        }

        // Filter by minimum severity if specified
        if (minimumSeverity.HasValue)
        {
            allIssues = allIssues.Where(i => i.Severity >= minimumSeverity.Value).ToList();
        }

        return allIssues.OrderByDescending(i => i.Severity).ThenByDescending(i => i.DaysSinceUpdate);
    }

    private async Task<DataTypeHealth> GetPriceHealthAsync(CancellationToken cancellationToken)
    {
        var instruments = await _context.Instruments
            .Include(i => i.Prices)
            .Where(i => i.Type == Domain.Entities.InstrumentType.Security)
            .ToListAsync(cancellationToken);

        var total = instruments.Count;
        var staleCount = 0;
        DateTime? oldestUpdate = null;

        foreach (var instrument in instruments)
        {
            var latestPrice = instrument.Prices.OrderByDescending(p => p.Date).FirstOrDefault();
            if (latestPrice == null || DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - latestPrice.Date.DayNumber > _settings.PriceStalenessThresholdDays)
            {
                staleCount++;
            }

            if (latestPrice != null && (oldestUpdate == null || latestPrice.UpdatedAt < oldestUpdate))
            {
                oldestUpdate = latestPrice.UpdatedAt;
            }
        }

        var severity = staleCount == 0 ? HealthSeverity.OK :
                       staleCount > total / 2 ? HealthSeverity.Critical :
                       HealthSeverity.Warning;

        return new DataTypeHealth("Instrument Prices", severity, total, staleCount, total - staleCount, oldestUpdate);
    }

    private async Task<DataTypeHealth> GetFxRateHealthAsync(CancellationToken cancellationToken)
    {
        var fxRates = await _context.FxRates
            .GroupBy(r => new { r.BaseCurrency, r.QuoteCurrency })
            .Select(g => new { LastUpdate = g.Max(r => r.UpdatedAt) })
            .ToListAsync(cancellationToken);

        var total = fxRates.Count;
        var staleCount = fxRates.Count(r => (DateTime.UtcNow - r.LastUpdate).Days > _settings.FxRateStalenessThresholdDays);
        var oldestUpdate = fxRates.Any() ? fxRates.Min(r => r.LastUpdate) : (DateTime?)null;

        var severity = staleCount == 0 ? HealthSeverity.OK :
                       staleCount > total / 2 ? HealthSeverity.Critical :
                       HealthSeverity.Warning;

        return new DataTypeHealth("FX Rates", severity, total, staleCount, total - staleCount, oldestUpdate);
    }

    private async Task<DataTypeHealth> GetBenchmarkHealthAsync(CancellationToken cancellationToken)
    {
        var benchmarks = await _context.Benchmarks
            .Include(b => b.Prices)
            .Where(b => b.IsActive)
            .ToListAsync(cancellationToken);

        var total = benchmarks.Count;
        var staleCount = 0;
        DateTime? oldestUpdate = null;

        foreach (var benchmark in benchmarks)
        {
            var latestPrice = benchmark.Prices.OrderByDescending(p => p.Date).FirstOrDefault();
            if (latestPrice == null || DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - latestPrice.Date.DayNumber > _settings.BenchmarkStalenessThresholdDays)
            {
                staleCount++;
            }

            if (latestPrice != null && (oldestUpdate == null || latestPrice.UpdatedAt < oldestUpdate))
            {
                oldestUpdate = latestPrice.UpdatedAt;
            }
        }

        var severity = staleCount == 0 ? HealthSeverity.OK :
                       staleCount > total / 2 ? HealthSeverity.Critical :
                       HealthSeverity.Warning;

        return new DataTypeHealth("Benchmark Prices", severity, total, staleCount, total - staleCount, oldestUpdate);
    }

    private async Task<DataTypeHealth> GetHoldingHealthAsync(CancellationToken cancellationToken)
    {
        var accounts = await _context.Accounts
            .Include(a => a.Holdings)
            .ToListAsync(cancellationToken);

        var total = accounts.Count;
        var staleCount = 0;
        DateTime? oldestUpdate = null;

        foreach (var account in accounts)
        {
            var latestHolding = account.Holdings.OrderByDescending(h => h.Date).FirstOrDefault();
            if (latestHolding == null || (DateTime.UtcNow - latestHolding.Date.ToDateTime(TimeOnly.MinValue)).Days > _settings.HoldingStalenessThresholdDays)
            {
                staleCount++;
            }

            if (latestHolding != null)
            {
                var holdingDate = latestHolding.Date.ToDateTime(TimeOnly.MinValue);
                if (oldestUpdate == null || holdingDate < oldestUpdate)
                {
                    oldestUpdate = holdingDate;
                }
            }
        }

        var severity = staleCount == 0 ? HealthSeverity.OK :
                       staleCount > total / 2 ? HealthSeverity.Critical :
                       HealthSeverity.Warning;

        return new DataTypeHealth("Holdings", severity, total, staleCount, total - staleCount, oldestUpdate);
    }
}
