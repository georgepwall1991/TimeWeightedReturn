using Application.Features.Portfolio.DTOs;
using Application.Services;
using Domain.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PortfolioRepository : IPortfolioRepository
{
    private readonly PortfolioContext _context;
    private readonly ICurrencyConversionService _currencyService;

    public PortfolioRepository(PortfolioContext context, ICurrencyConversionService currencyService)
    {
        _context = context;
        _currencyService = currencyService;
    }

    public async Task<IEnumerable<Holding>> GetPortfolioHoldingsAsync(Guid portfolioId, DateOnly date)
    {
        return await _context.Holdings
            .Where(h => h.Account.PortfolioId == portfolioId && h.Date == date)
            .Include(h => h.Instrument)
            .Include(h => h.Account)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Holding>> GetAccountHoldingsAsync(Guid accountId, DateOnly date)
    {
        // Try to get holdings for the requested date
        var holdings = await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date == date)
            .Include(h => h.Instrument)
            .Include(h => h.Account)
            .AsNoTracking()
            .ToListAsync();

        // If no holdings for the requested date, find the latest date with holdings on or before the requested date
        if (!holdings.Any())
        {
            var latestDate = await _context.Holdings
                .Where(h => h.AccountId == accountId && h.Date <= date)
                .OrderByDescending(h => h.Date)
                .Select(h => h.Date)
                .FirstOrDefaultAsync();

            if (latestDate != default)
                holdings = await _context.Holdings
                    .Where(h => h.AccountId == accountId && h.Date == latestDate)
                    .Include(h => h.Instrument)
                    .Include(h => h.Account)
                    .AsNoTracking()
                    .ToListAsync();
        }

        return holdings;
    }

    public async Task<decimal> GetAccountValueAsync(Guid accountId, DateOnly date)
    {
        var holdings = await GetAccountHoldingsAsync(accountId, date);
        if (!holdings.Any())
            return 0;

        var instrumentIds = holdings.Select(h => h.InstrumentId).ToList();
        var prices = await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) && p.Date == date)
            .AsNoTracking()
            .ToListAsync();

        var currencies = holdings.Select(h => h.Instrument.Currency).Distinct().ToList();
        var fxRates = await _context.FxRates
            .Where(fx => currencies.Contains(fx.QuoteCurrency) && fx.Date == date)
            .AsNoTracking()
            .ToListAsync();

        decimal totalValue = 0;
        foreach (var holding in holdings)
        {
            var price = prices.FirstOrDefault(p => p.InstrumentId == holding.InstrumentId);
            if (price == null)
                continue;

            var localValue = holding.Units * price.Value;
            var valueGbp = _currencyService.ConvertToGbp(localValue, holding.Instrument.Currency, date, fxRates);
            totalValue += valueGbp;
        }

        return totalValue;
    }

    public async Task<List<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date >= startDate && h.Date <= endDate)
            .Select(h => h.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null, string? userId = null)
    {
        var query = _context.Clients
            .Include(c => c.Portfolios)
            .ThenInclude(p => p.Accounts)
            .AsNoTracking();

        if (clientId.HasValue)
        {
            query = query.Where(c => c.Id == clientId.Value);
        }

        if (!string.IsNullOrEmpty(userId))
        {
            query = query.Where(c => c.UserId == userId);
        }

        return await query.ToListAsync();
    }

    public async Task<IEnumerable<Portfolio>> GetPortfoliosWithAccountsAsync(Guid clientId)
    {
        return await _context.Portfolios
            .Where(p => p.ClientId == clientId)
            .Include(p => p.Accounts)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Account>> GetAccountsAsync(Guid portfolioId)
    {
        return await _context.Accounts
            .Where(a => a.PortfolioId == portfolioId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<int> GetHoldingCountAsync(Guid accountId, DateOnly date)
    {
        return await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date == date)
            .CountAsync();
    }

    public async Task<Account?> GetAccountAsync(Guid accountId)
    {
        return await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == accountId);
    }

    public async Task<List<Holding>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date)
    {
        return await _context.Holdings
            .Include(h => h.Instrument)
            .Where(h => h.AccountId == accountId && h.Date == date)
            .ToListAsync();
    }

    private static decimal CalculateHoldingValueInGbp(Holding holding, decimal price, decimal fxRate)
    {
        var valueGbp = holding.Units * price * fxRate;
        return valueGbp;
    }

    public async Task<Dictionary<Guid, decimal>> GetPricesForHoldingsAsync(IEnumerable<Guid> holdingIds)
    {
        var holdings = await _context.Holdings
            .Where(h => holdingIds.Contains(h.Id))
            .Include(h => h.Instrument)
            .ToListAsync();

        var prices = await _context.Prices
            .Where(p => holdings.Select(h => h.InstrumentId).Contains(p.InstrumentId))
            .ToDictionaryAsync(p => p.InstrumentId, p => p.Value);

        return holdings.ToDictionary(
            h => h.Id,
            h => prices.GetValueOrDefault(h.InstrumentId)
        );
    }

    public async Task<Dictionary<(string Base, string Quote), decimal>> GetFxRatesForHoldingsAsync(
        IEnumerable<(string Base, string Quote)> currencyPairs)
    {
        var pairs = currencyPairs.ToList();
        if (!pairs.Any())
            return new Dictionary<(string Base, string Quote), decimal>();

        var rates = await _context.FxRates
            .Where(f => pairs.Any(p => p.Base == f.BaseCurrency && p.Quote == f.QuoteCurrency))
            .ToListAsync();

        var result = new Dictionary<(string Base, string Quote), decimal>();
        foreach (var rate in rates) result[(rate.BaseCurrency, rate.QuoteCurrency)] = rate.Rate;

        // Add identity rates for same currency pairs
        foreach (var pair in pairs.Where(p => p.Base == p.Quote)) result[pair] = 1m;

        return result;
    }

    public async Task<Portfolio?> GetPortfolioWithHoldingsAsync(Guid portfolioId, DateOnly date)
    {
        return await _context.Portfolios
            .Include(p => p.Accounts)
            .ThenInclude(a => a.Holdings)
            .ThenInclude(h => h.Instrument)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == portfolioId);
    }

    public async Task<Benchmark?> GetBenchmarkWithHoldingsAsync(Guid benchmarkId)
    {
        return await _context.Benchmarks
            .Include(b => b.Holdings)
            .ThenInclude(h => h.Instrument)
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == benchmarkId);
    }

    public async Task<decimal> GetInstrumentReturnAsync(Guid instrumentId, DateOnly startDate, DateOnly endDate)
    {
        var startPrice = await _context.Prices
            .Where(p => p.InstrumentId == instrumentId && p.Date == startDate)
            .Select(p => p.Value)
            .FirstOrDefaultAsync();

        var endPrice = await _context.Prices
            .Where(p => p.InstrumentId == instrumentId && p.Date == endDate)
            .Select(p => p.Value)
            .FirstOrDefaultAsync();

        if (startPrice == 0 || startPrice == default || endPrice == default)
        {
            return 0;
        }

        return (endPrice - startPrice) / startPrice;
    }

    public async Task<List<Price>> GetPricesAsync(List<Guid> instrumentIds, DateOnly date)
    {
        return await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) && p.Date == date)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<FxRate>> GetFxRatesAsync(List<string> currencies, DateOnly date)
    {
        return await _context.FxRates
            .Where(fx => currencies.Contains(fx.QuoteCurrency) && fx.Date == date)
            .AsNoTracking()
            .ToListAsync();
    }
}
