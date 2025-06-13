using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class TestDataSeeder
{
    private readonly PortfolioContext _context;

    public TestDataSeeder(PortfolioContext context)
    {
        _context = context;
    }

    public async Task SeedHistoricalDataAsync()
    {
        // Don't reseed if we already have historical data
        var existingHistoricalPrices = await _context.Prices
            .Where(p => p.Date < DateOnly.FromDateTime(DateTime.Today.AddDays(-30)))
            .AnyAsync();

        if (existingHistoricalPrices) return;

        // Get existing instruments
        var instruments = await _context.Instruments.ToListAsync();
        var aaplInstrument = instruments.FirstOrDefault(i => i.Ticker == "AAPL");
        var msftInstrument = instruments.FirstOrDefault(i => i.Ticker == "MSFT");
        var cashGbpInstrument = instruments.FirstOrDefault(i => i.Ticker == "CASH_GBP");
        var cashUsdInstrument = instruments.FirstOrDefault(i => i.Ticker == "CASH_USD");

        if (aaplInstrument == null || msftInstrument == null || cashGbpInstrument == null ||
            cashUsdInstrument == null) return; // Skip if instruments don't exist

        // Get existing accounts
        var accounts = await _context.Accounts.ToListAsync();
        var isaAccount = accounts.FirstOrDefault(a => a.AccountNumber == "ISA001");
        var giaAccount = accounts.FirstOrDefault(a => a.AccountNumber == "GIA001");

        if (isaAccount == null || giaAccount == null) return; // Skip if accounts don't exist

        // Clear existing holdings for clean test data
        var existingHoldings = await _context.Holdings.ToListAsync();
        _context.Holdings.RemoveRange(existingHoldings);

        // Create historical prices and holdings for the last 6 months
        var startDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(-6));
        var endDate = DateOnly.FromDateTime(DateTime.Today);

        var prices = new List<Price>();
        var holdings = new List<Holding>();
        var random = new Random(42); // Consistent seed for reproducible results

        // Initial prices
        var aaplPrice = 150.00m;
        var msftPrice = 350.00m;
        var cashPrice = 1.00m;

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Skip weekends for price data
            var dayOfWeek = date.DayOfWeek;
            if (dayOfWeek == DayOfWeek.Saturday || dayOfWeek == DayOfWeek.Sunday)
                continue;

            // Create price volatility
            aaplPrice *= (decimal)(1 + (random.NextDouble() - 0.5) * 0.04); // ±2% daily volatility
            msftPrice *= (decimal)(1 + (random.NextDouble() - 0.5) * 0.03); // ±1.5% daily volatility

            // Ensure prices stay reasonable
            aaplPrice = Math.Max(100m, Math.Min(200m, aaplPrice));
            msftPrice = Math.Max(250m, Math.Min(450m, msftPrice));

            // Add prices
            prices.AddRange([
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = aaplInstrument.Id,
                    Date = date,
                    Value = Math.Round(aaplPrice, 2),
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = msftInstrument.Id,
                    Date = date,
                    Value = Math.Round(msftPrice, 2),
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = cashGbpInstrument.Id,
                    Date = date,
                    Value = cashPrice,
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = cashUsdInstrument.Id,
                    Date = date,
                    Value = cashPrice,
                    CreatedAt = DateTime.UtcNow
                }
            ]);

            // Add holdings for specific dates (monthly snapshots)
            if (date.Day == 1 || date == endDate) // First of month or last day
            {
                // ISA Account holdings
                holdings.AddRange([
                    new Holding
                    {
                        Id = Guid.NewGuid(),
                        AccountId = isaAccount.Id,
                        InstrumentId = aaplInstrument.Id,
                        Date = date,
                        Units = 100m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Holding
                    {
                        Id = Guid.NewGuid(),
                        AccountId = isaAccount.Id,
                        InstrumentId = msftInstrument.Id,
                        Date = date,
                        Units = 50m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Holding
                    {
                        Id = Guid.NewGuid(),
                        AccountId = isaAccount.Id,
                        InstrumentId = cashGbpInstrument.Id,
                        Date = date,
                        Units = 5000m,
                        CreatedAt = DateTime.UtcNow
                    }
                ]);

                // GIA Account holdings
                holdings.AddRange([
                    new Holding
                    {
                        Id = Guid.NewGuid(),
                        AccountId = giaAccount.Id,
                        InstrumentId = msftInstrument.Id,
                        Date = date,
                        Units = 25m,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Holding
                    {
                        Id = Guid.NewGuid(),
                        AccountId = giaAccount.Id,
                        InstrumentId = cashUsdInstrument.Id,
                        Date = date,
                        Units = 2000m,
                        CreatedAt = DateTime.UtcNow
                    }
                ]);
            }
        }

        // Add FX rates for historical data
        var fxRates = new List<FxRate>();
        var usdGbpRate = 1.25m; // Starting rate

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Add some FX volatility
            usdGbpRate *= (decimal)(1 + (random.NextDouble() - 0.5) * 0.02); // ±1% daily volatility
            usdGbpRate = Math.Max(1.15m, Math.Min(1.35m, usdGbpRate)); // Keep within reasonable bounds

            fxRates.Add(new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = "GBP",
                QuoteCurrency = "USD",
                Date = date,
                Rate = Math.Round(usdGbpRate, 4),
                CreatedAt = DateTime.UtcNow
            });
        }

        // Add some cash flows for TWR calculation
        var cashFlows = new List<CashFlow>();

        // Add quarterly contributions
        var quarterlyDates = new[]
        {
            startDate.AddMonths(1),
            startDate.AddMonths(2),
            startDate.AddMonths(3),
            startDate.AddMonths(4)
        };

        foreach (var quarterDate in quarterlyDates)
            cashFlows.AddRange([
                new CashFlow
                {
                    Id = Guid.NewGuid(),
                    AccountId = isaAccount.Id,
                    Date = quarterDate,
                    Amount = 2000m, // £2000 quarterly contribution
                    Description = "Quarterly Contribution",
                    Type = CashFlowType.ClientContribution,
                    Category = CashFlowCategory.ExternalFlow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CashFlow
                {
                    Id = Guid.NewGuid(),
                    AccountId = giaAccount.Id,
                    Date = quarterDate,
                    Amount = 1000m, // £1000 quarterly contribution
                    Description = "Quarterly Contribution",
                    Type = CashFlowType.ClientContribution,
                    Category = CashFlowCategory.ExternalFlow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            ]);

        // Bulk insert data
        await _context.Prices.AddRangeAsync(prices);
        await _context.Holdings.AddRangeAsync(holdings);
        await _context.FxRates.AddRangeAsync(fxRates);
        await _context.CashFlows.AddRangeAsync(cashFlows);

        await _context.SaveChangesAsync();
    }
}
