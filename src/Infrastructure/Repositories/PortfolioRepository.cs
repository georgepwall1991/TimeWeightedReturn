using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using Application.Services;
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
            return Enumerable.Empty<HoldingDto>();

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
            {
                throw new InvalidOperationException(
                    $"No price found for instrument {holding.Instrument.Ticker} on {date}");
            }

            var localValue = holding.Units * price.Value;
            var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates);
            var valueGBP = _currencyService.ConvertToGBP(localValue, holding.Instrument.Currency, date, fxRates);

            result.Add(new HoldingDto
            {
                HoldingId = holding.Id,
                Ticker = holding.Instrument.Ticker,
                InstrumentName = holding.Instrument.Name,
                InstrumentType = holding.Instrument.Type.ToString(),
                Currency = holding.Instrument.Currency,
                Units = holding.Units,
                Price = price.Value,
                LocalValue = localValue,
                FxRate = fxRate,
                ValueGBP = valueGBP,
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
        // Get holdings for the specific account on the specified date
        var holdings = await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date == date)
            .Include(h => h.Instrument)
            .Include(h => h.Account)
            .AsNoTracking()
            .ToListAsync();

        if (!holdings.Any())
            return Enumerable.Empty<HoldingDto>();

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
            {
                throw new InvalidOperationException(
                    $"No price found for instrument {holding.Instrument.Ticker} on {date}");
            }

            var localValue = holding.Units * price.Value;
            var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates);
            var valueGBP = _currencyService.ConvertToGBP(localValue, holding.Instrument.Currency, date, fxRates);

            result.Add(new HoldingDto
            {
                HoldingId = holding.Id,
                Ticker = holding.Instrument.Ticker,
                InstrumentName = holding.Instrument.Name,
                InstrumentType = holding.Instrument.Type.ToString(),
                Currency = holding.Instrument.Currency,
                Units = holding.Units,
                Price = price.Value,
                LocalValue = localValue,
                FxRate = fxRate,
                ValueGBP = valueGBP,
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

    public async Task<IEnumerable<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date >= startDate && h.Date <= endDate)
            .Select(h => h.Date)
            .Distinct()
            .OrderBy(d => d)
            .ToListAsync();
    }

    public async Task<IEnumerable<Domain.Entities.Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null)
    {
        var query = _context.Clients
            .Include(c => c.Portfolios)
            .ThenInclude(p => p.Accounts)
            .AsNoTracking();

        if (clientId.HasValue)
        {
            query = query.Where(c => c.Id == clientId.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<IEnumerable<Domain.Entities.Portfolio>> GetPortfoliosWithAccountsAsync(Guid clientId)
    {
        return await _context.Portfolios
            .Where(p => p.ClientId == clientId)
            .Include(p => p.Accounts)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Domain.Entities.Account>> GetAccountsAsync(Guid portfolioId)
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

    public async Task<Domain.Entities.Account?> GetAccountAsync(Guid accountId)
    {
        return await _context.Accounts
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == accountId);
    }

    public async Task<IEnumerable<HoldingDto>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date)
    {
        var holdings = await _context.Holdings
            .Where(h => h.AccountId == accountId && h.Date == date)
            .Include(h => h.Instrument)
            .Include(h => h.Account)
            .AsNoTracking()
            .ToListAsync();

        var instrumentIds = holdings.Select(h => h.InstrumentId).Distinct().ToList();
        var currencies = holdings.Select(h => h.Instrument.Currency).Where(c => c != "GBP").Distinct().ToList();

        var prices = await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) && p.Date == date)
            .AsNoTracking()
            .ToListAsync();

        var fxRates = currencies.Any()
            ? await _context.FxRates
                .Where(f => currencies.Contains(f.QuoteCurrency) && f.Date == date)
                .AsNoTracking()
                .ToListAsync()
            : new List<Domain.Entities.FxRate>();

        return holdings.Select(holding =>
        {
            var price = prices.FirstOrDefault(p => p.InstrumentId == holding.InstrumentId);

            var localValue = holding.Units * (price?.Value ?? 0);
            var valueGBP = _currencyService.ConvertToGBP(localValue, holding.Instrument.Currency, date, fxRates);
            var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates);

            return new HoldingDto
            {
                HoldingId = holding.Id,
                Ticker = holding.Instrument.Ticker,
                InstrumentName = holding.Instrument.Name,
                InstrumentType = holding.Instrument.Type.ToString(),
                Currency = holding.Instrument.Currency,
                Units = holding.Units,
                Price = price?.Value ?? 0,
                LocalValue = localValue,
                FxRate = fxRate,
                ValueGBP = valueGBP,
                Date = holding.Date
            };
        }).ToList();
    }
}
