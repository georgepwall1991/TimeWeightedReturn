using Application.Features.Common.Interfaces;
using Application.Features.Portfolio.DTOs;
using Application.Services;
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

    public async Task<IEnumerable<HoldingDto>> GetPortfolioHoldingsAsync(Guid portfolioId, DateOnly date)
    {
        // Get holdings for all accounts in the portfolio on the specified date
        var holdings = await _context.Holdings
            .Where(h => h.Account.PortfolioId == portfolioId && h.Date == date)
            .Include(h => h.Instrument)
            .Include(h => h.Account)
            .AsNoTracking()
            .ToListAsync();

        if (!holdings.Any())
            return [];

        // Get prices for the specified date
        var instrumentIds = holdings.Select(h => h.InstrumentId).ToList();
        var prices = await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) && p.Date == date)
            .AsNoTracking()
            .ToListAsync();

        // Get FX rates for the specified date
        var currencies = holdings.Select(h => h.Instrument.Currency).Distinct().ToList();
        var fxRates = await _context.FxRates
            .Where(fx => currencies.Contains(fx.QuoteCurrency) && fx.Date == date)
            .AsNoTracking()
            .ToListAsync();

        // Build result DTOs
        var result = new List<HoldingDto>();

        foreach (var holding in holdings)
        {
            var price = prices.FirstOrDefault(p => p.InstrumentId == holding.InstrumentId);
            if (price == null)
                throw new InvalidOperationException(
                    $"No price found for instrument {holding.Instrument.Ticker} on {date}");

            var localValue = holding.Units * price.Value;
            var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates) ?? 1.0m;
            var valueGbp = _currencyService.ConvertToGbp(localValue, holding.Instrument.Currency, date, fxRates);

            result.Add(new HoldingDto
            {
                HoldingId = holding.Id,
                Ticker = holding.Instrument.Ticker,
                Name = holding.Instrument.Name,
                InstrumentType = holding.Instrument.Type.ToString(),
                Currency = holding.Instrument.Currency,
                Units = holding.Units,
                Price = price.Value,
                LocalValue = localValue,
                FxRate = fxRate,
                ValueGBP = valueGbp,
                Date = holding.Date
            });
        }

        // Sort by instrument type (Cash first, then Securities) and then by ticker
        return result
            .OrderBy(h => h.InstrumentType == "Cash" ? 0 : 1)
            .ThenBy(h => h.Ticker)
            .ToList();
    }

    public async Task<IEnumerable<HoldingDto>> GetAccountHoldingsAsync(Guid accountId, DateOnly date)
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

        if (!holdings.Any())
            return [];

        // Get prices for the specified date
        var instrumentIds = holdings.Select(h => h.InstrumentId).ToList();
        var prices = await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) && p.Date == date)
            .AsNoTracking()
            .ToListAsync();

        // If any price is missing, try to get the latest available price on or before the date for each instrument
        // FIXED: Batch query to avoid N+1 anti-pattern
        var missingPriceInstrumentIds = instrumentIds.Except(prices.Select(p => p.InstrumentId)).ToList();
        if (missingPriceInstrumentIds.Any())
        {
            var latestPrices = await _context.Prices
                .Where(p => missingPriceInstrumentIds.Contains(p.InstrumentId) && p.Date <= date)
                .GroupBy(p => p.InstrumentId)
                .Select(g => g.OrderByDescending(p => p.Date).First())
                .AsNoTracking()
                .ToListAsync();
            prices.AddRange(latestPrices);
        }

        // Get FX rates for the specified date
        var currencies = holdings.Select(h => h.Instrument.Currency).Distinct().ToList();
        var fxRates = await _context.FxRates
            .Where(fx => fx.BaseCurrency == "GBP" && currencies.Contains(fx.QuoteCurrency) && fx.Date == date)
            .AsNoTracking()
            .ToListAsync();

        // If any FX rate is missing, try to get the latest available FX rate on or before the date for each currency
        // FIXED: Batch query to avoid N+1 anti-pattern
        var missingFxCurrencies = currencies.Except(fxRates.Select(fx => fx.QuoteCurrency)).ToList();
        if (missingFxCurrencies.Any())
        {
            var latestFxRates = await _context.FxRates
                .Where(fx => fx.BaseCurrency == "GBP" && missingFxCurrencies.Contains(fx.QuoteCurrency) && fx.Date <= date)
                .GroupBy(fx => fx.QuoteCurrency)
                .Select(g => g.OrderByDescending(fx => fx.Date).First())
                .AsNoTracking()
                .ToListAsync();
            fxRates.AddRange(latestFxRates);
        }

        // Build result DTOs
        var result = new List<HoldingDto>();

        foreach (var holding in holdings)
        {
            // Try to get the latest available price on or before the date for this instrument
            var price = prices.FirstOrDefault(p => p.InstrumentId == holding.InstrumentId) ?? await _context.Prices
                .Where(p => p.InstrumentId == holding.InstrumentId && p.Date <= date)
                .OrderByDescending(p => p.Date)
                .FirstOrDefaultAsync();

            if (price == null)
                throw new InvalidOperationException(
                    $"No price found for instrument {holding.Instrument.Ticker} on or before {date}");

            var localValue = holding.Units * price.Value;

            // Try to get FX rate for this currency
            var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates);
            if (fxRate == null)
            {
                // Try to get the latest available FX rate on or before the date for this currency
                var latestFx = await _context.FxRates
                    .Where(fx => fx.BaseCurrency == "GBP" && fx.QuoteCurrency == holding.Instrument.Currency && fx.Date <= date)
                    .OrderByDescending(fx => fx.Date)
                    .FirstOrDefaultAsync();
                if (latestFx != null) fxRate = latestFx.Rate;
            }

            if (fxRate == null)
                throw new InvalidOperationException(
                    $"No FX rate found for currency {holding.Instrument.Currency} on or before {date}");

            var valueGbp = _currencyService.ConvertToGbp(localValue, holding.Instrument.Currency, date, fxRates);

            result.Add(new HoldingDto
            {
                HoldingId = holding.Id,
                Ticker = holding.Instrument.Ticker,
                Name = holding.Instrument.Name,
                InstrumentType = holding.Instrument.Type.ToString(),
                Currency = holding.Instrument.Currency,
                Units = holding.Units,
                Price = price.Value,
                LocalValue = localValue,
                FxRate = fxRate.Value,
                ValueGBP = valueGbp,
                Date = holding.Date
            });
        }

        return result
            .OrderBy(h => h.InstrumentType == "Cash" ? 0 : 1)
            .ThenBy(h => h.Ticker)
            .ToList();
    }

    public async Task<decimal> GetAccountValueAsync(Guid accountId, DateOnly date)
    {
        var holdings = await GetAccountHoldingsAsync(accountId, date);
        return holdings.Sum(h => h.ValueGBP);
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

    public async Task<IEnumerable<Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null)
    {
        var query = _context.Clients
            .Include(c => c.Portfolios)
            .ThenInclude(p => p.Accounts)
            .AsNoTracking();

        if (clientId.HasValue) query = query.Where(c => c.Id == clientId.Value);

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

    public async Task<List<HoldingDto>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date)
    {
        var holdings = await _context.Holdings
            .Include(h => h.Instrument)
            .Where(h => h.AccountId == accountId && h.Date == date)
            .ToListAsync();

        var prices = await _context.Prices
            .Where(p => holdings.Select(h => h.InstrumentId).Contains(p.InstrumentId) && p.Date == date)
            .ToDictionaryAsync(p => p.InstrumentId, p => p.Value);

        // Get all unique currencies that need FX rates
        var currencies = holdings
            .Select(h => h.Instrument.Currency)
            .Distinct()
            .Where(c => c != "GBP")
            .ToList();

        var fxRates = new Dictionary<string, decimal>();
        if (currencies.Any())
        {
            var rates = await _context.FxRates
                .Where(f => f.Date == date && f.QuoteCurrency == "GBP" && currencies.Contains(f.BaseCurrency))
                .ToListAsync();

            foreach (var rate in rates) fxRates[rate.BaseCurrency] = rate.Rate;
        }

        return holdings.Select(h =>
        {
            var price = prices.GetValueOrDefault(h.InstrumentId);
            var fxRate = h.Instrument.Currency == "GBP" ? 1m : fxRates.GetValueOrDefault(h.Instrument.Currency, 1m);
            var valueGbp = CalculateHoldingValueInGbp(h, price, fxRate);

            return new HoldingDto
            {
                HoldingId = h.Id,
                Ticker = h.Instrument.Ticker,
                Name = h.Instrument.Name,
                InstrumentType = h.Instrument.Type.ToString(),
                Currency = h.Instrument.Currency,
                Units = h.Units,
                Price = price,
                LocalValue = h.Units * price,
                FxRate = fxRate,
                ValueGBP = valueGbp,
                Date = h.Date
            };
        }).ToList();
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
}
