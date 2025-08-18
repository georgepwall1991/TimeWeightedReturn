using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class DataSeeder
{
    private readonly PortfolioContext _context;

    public DataSeeder(PortfolioContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Skip if data already exists
        if (await _context.Clients.AnyAsync())
            return;

        // Create sample clients for different users
        var client1 = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Smith Family Trust",
            UserId = "user1",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var client2 = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Jones Investments",
            UserId = "user2",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Clients.AddRange(client1, client2);

        // Create sample portfolios for each client
        var portfolio1 = new Portfolio
        {
            Id = Guid.NewGuid(),
            Name = "Conservative Growth Portfolio",
            ClientId = client1.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var portfolio2 = new Portfolio
        {
            Id = Guid.NewGuid(),
            Name = "Aggressive Tech Portfolio",
            ClientId = client2.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Portfolios.AddRange(portfolio1, portfolio2);

        // Create sample accounts
        var account1 = new Account
        {
            Id = Guid.NewGuid(),
            Name = "ISA Account",
            AccountNumber = "ISA001",
            PortfolioId = portfolio1.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var account2 = new Account
        {
            Id = Guid.NewGuid(),
            Name = "General Investment Account",
            AccountNumber = "GIA001",
            PortfolioId = portfolio1.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var account3 = new Account
        {
            Id = Guid.NewGuid(),
            Name = "Tech Stocks Account",
            AccountNumber = "TSA001",
            PortfolioId = portfolio2.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Accounts.AddRange(account1, account2, account3);

        // Create sample instruments
        var instruments = new[]
        {
            // US Equities (Large Cap)
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "AAPL",
                Name = "Apple Inc.",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "MSFT",
                Name = "Microsoft Corporation",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "GOOGL",
                Name = "Alphabet Inc.",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // US Equities (Mid Cap)
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "UBER",
                Name = "Uber Technologies Inc.",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "SQ",
                Name = "Block Inc.",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // ETFs
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "VOO",
                Name = "Vanguard S&P 500 ETF",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "VWRL",
                Name = "Vanguard FTSE All-World UCITS ETF",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "IEMG",
                Name = "iShares Core MSCI Emerging Markets ETF",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // UK Equities
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "HSBA",
                Name = "HSBC Holdings plc",
                Currency = "GBP",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "BP",
                Name = "BP plc",
                Currency = "GBP",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // European Equities
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "ASML",
                Name = "ASML Holding NV",
                Currency = "EUR",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "SAP",
                Name = "SAP SE",
                Currency = "EUR",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // Emerging Market Equities
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "BABA",
                Name = "Alibaba Group Holding Ltd",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "TCS",
                Name = "Tata Consultancy Services Ltd",
                Currency = "INR",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // Bonds
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "AGG",
                Name = "iShares Core U.S. Aggregate Bond ETF",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "IGOV",
                Name = "iShares International Treasury Bond ETF",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // Commodities
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "GLD",
                Name = "SPDR Gold Shares",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "USO",
                Name = "United States Oil Fund",
                Currency = "USD",
                Type = InstrumentType.Security,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            // Cash instruments
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "CASH_GBP",
                Name = "Cash - British Pound",
                Currency = "GBP",
                Type = InstrumentType.Cash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "CASH_USD",
                Name = "Cash - US Dollar",
                Currency = "USD",
                Type = InstrumentType.Cash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "CASH_EUR",
                Name = "Cash - Euro",
                Currency = "EUR",
                Type = InstrumentType.Cash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "CASH_JPY",
                Name = "Cash - Japanese Yen",
                Currency = "JPY",
                Type = InstrumentType.Cash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Instrument
            {
                Id = Guid.NewGuid(),
                Ticker = "CASH_INR",
                Name = "Cash - Indian Rupee",
                Currency = "INR",
                Type = InstrumentType.Cash,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
        _context.Instruments.AddRange(instruments);

        // Generate comprehensive FX rates and market data
        var (fxRates, marketDates) = GenerateMarketData();
        _context.FxRates.AddRange(fxRates);

        // Create sample prices for multiple dates to show returns over time
        var pricesList = new List<Price>();

        // Define base prices and growth rates for each instrument with market-realistic volatility
        var instrumentPrices = new Dictionary<string, (decimal BasePrice, decimal GrowthRate, decimal Volatility)>
        {
            // US Large Cap (Lower volatility)
            { "AAPL", (152.60m, 0.15m, 0.015m) }, // 15% growth, 1.5% daily volatility
            { "MSFT", (370.80m, 0.12m, 0.014m) }, // 12% growth, 1.4% daily volatility
            { "GOOGL", (142.50m, 0.14m, 0.016m) }, // 14% growth, 1.6% daily volatility

            // US Mid Cap (Higher volatility)
            { "UBER", (45.20m, 0.18m, 0.025m) }, // 18% growth, 2.5% daily volatility
            { "SQ", (65.80m, 0.16m, 0.028m) }, // 16% growth, 2.8% daily volatility

            // ETFs (Lower volatility)
            { "VOO", (430.80m, 0.08m, 0.012m) }, // 8% growth, 1.2% daily volatility
            { "VWRL", (95.20m, 0.09m, 0.013m) }, // 9% growth, 1.3% daily volatility
            { "IEMG", (48.60m, 0.11m, 0.018m) }, // 11% growth, 1.8% daily volatility

            // UK Equities (Moderate volatility)
            { "HSBA", (580.40m, 0.05m, 0.016m) }, // 5% growth, 1.6% daily volatility
            { "BP", (480.60m, 0.06m, 0.019m) }, // 6% growth, 1.9% daily volatility

            // European Equities
            { "ASML", (780.20m, 0.16m, 0.022m) }, // 16% growth, 2.2% daily volatility
            { "SAP", (145.80m, 0.07m, 0.017m) }, // 7% growth, 1.7% daily volatility

            // Emerging Markets (Higher volatility)
            { "BABA", (75.40m, 0.20m, 0.032m) }, // 20% growth, 3.2% daily volatility
            { "TCS", (3800.00m, 0.15m, 0.028m) }, // 15% growth, 2.8% daily volatility

            // Bonds (Lowest volatility)
            { "AGG", (98.20m, 0.03m, 0.008m) }, // 3% growth, 0.8% daily volatility
            { "IGOV", (52.40m, 0.02m, 0.009m) }, // 2% growth, 0.9% daily volatility

            // Commodities (Highest volatility)
            { "GLD", (185.60m, 0.06m, 0.024m) }, // 6% growth, 2.4% daily volatility
            { "USO", (72.80m, 0.04m, 0.035m) } // 4% growth, 3.5% daily volatility
        };

        var random = new Random(42); // Use same seed for reproducibility

        foreach (var date in marketDates)
        {
            // Calculate days since start as a percentage of total period
            var daysSinceStart = (date.ToDateTime(TimeOnly.MinValue) - marketDates[0].ToDateTime(TimeOnly.MinValue))
                .TotalDays;
            var totalDays =
                (marketDates[^1].ToDateTime(TimeOnly.MinValue) - marketDates[0].ToDateTime(TimeOnly.MinValue))
                .TotalDays;
            var progress = (decimal)(daysSinceStart / totalDays);

            foreach (var instrument in instruments)
            {
                decimal price;
                if (instrument.Type == InstrumentType.Cash)
                {
                    price = 1.00m; // Cash always has price of 1
                }
                else
                {
                    var (basePrice, growthRate, volatility) = instrumentPrices[instrument.Ticker];

                    // Add some random daily volatility
                    var dailyVolatility = (decimal)(random.NextDouble() - 0.5) * volatility;

                    // Calculate price with growth trend and volatility
                    price = Math.Round(basePrice * (1 + growthRate * progress + dailyVolatility), 2);

                    // Ensure price doesn't go below 40% of base price
                    price = Math.Max(price, basePrice * 0.4m);
                }

                pricesList.Add(new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instrument.Id,
                    Date = date,
                    Value = price,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        _context.Prices.AddRange(pricesList);

        // Create sample holdings for multiple dates (bi-weekly instead of weekly)
        var holdingsList = new List<Holding>();
        var holdingsDates = marketDates.Where((_, i) => i % 14 == 0).ToList();

        foreach (var date in holdingsDates)
        {
            // ISA Account holdings
            holdingsList.AddRange([
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account1.Id, InstrumentId = instruments[0].Id, Date = date,
                    Units = 100m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // AAPL
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account1.Id, InstrumentId = instruments[3].Id, Date = date,
                    Units = 50m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // VOO
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account1.Id, InstrumentId = instruments[4].Id, Date = date,
                    Units = 75m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // VWRL
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account1.Id, InstrumentId = instruments[9].Id, Date = date,
                    Units = 5000m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                } // CASH_GBP
            ]);

            // GIA Account holdings
            holdingsList.AddRange([
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[1].Id, Date = date,
                    Units = 75m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // MSFT
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[2].Id, Date = date,
                    Units = 50m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // GOOGL
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[6].Id, Date = date,
                    Units = 200m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // BP
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[7].Id, Date = date,
                    Units = 25m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // ASML
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[10].Id, Date = date,
                    Units = 2000m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }, // CASH_USD
                new Holding
                {
                    Id = Guid.NewGuid(), AccountId = account2.Id, InstrumentId = instruments[11].Id, Date = date,
                    Units = 1500m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                } // CASH_EUR
            ]);
        }

        // Add holdings for the new account
        holdingsList.AddRange([
            new Holding
            {
                Id = Guid.NewGuid(), AccountId = account3.Id, InstrumentId = instruments[0].Id, Date = holdingsDates.First(),
                Units = 200m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }, // AAPL
            new Holding
            {
                Id = Guid.NewGuid(), AccountId = account3.Id, InstrumentId = instruments[1].Id, Date = holdingsDates.First(),
                Units = 150m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            }, // MSFT
            new Holding
            {
                Id = Guid.NewGuid(), AccountId = account3.Id, InstrumentId = instruments[2].Id, Date = holdingsDates.First(),
                Units = 100m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
            } // GOOGL
        ]);

        _context.Holdings.AddRange(holdingsList);

        // Seed sample cash flows to demonstrate TWR calculation with flows
        await SeedCashFlows(account1.Id, account2.Id, instruments);

        // Seed benchmark data
        var benchmark = new Benchmark { Id = Guid.NewGuid(), Name = "S&P 500" };
        _context.Benchmarks.Add(benchmark);

        var benchmarkHoldings = new[]
        {
            new BenchmarkHolding { Id = Guid.NewGuid(), BenchmarkId = benchmark.Id, InstrumentId = instruments[0].Id, Weight = 0.4m }, // AAPL
            new BenchmarkHolding { Id = Guid.NewGuid(), BenchmarkId = benchmark.Id, InstrumentId = instruments[1].Id, Weight = 0.3m }, // MSFT
            new BenchmarkHolding { Id = Guid.NewGuid(), BenchmarkId = benchmark.Id, InstrumentId = instruments[2].Id, Weight = 0.3m }  // GOOGL
        };
        _context.BenchmarkHoldings.AddRange(benchmarkHoldings);

        await _context.SaveChangesAsync();
    }

    private (List<FxRate> FxRates, List<DateOnly> MarketDates) GenerateMarketData()
    {
        var fxRates = new List<FxRate>();
        var marketDates = new List<DateOnly>();
        var random = new Random(42); // Fixed seed for reproducibility

        // Calculate date range: 2 years back to T+7
        var endDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(7); // T+7
        var startDate = endDate.AddYears(-2); // 2 years back

        // Define currency pairs with their typical ranges
        var currencyPairs = new[]
        {
            new
            {
                Base = "GBP", Quote = "USD", BaseRate = 1.25m, MinRate = 1.10m, MaxRate = 1.40m, Volatility = 0.005m
            },
            new
            {
                Base = "GBP", Quote = "EUR", BaseRate = 1.15m, MinRate = 1.05m, MaxRate = 1.25m, Volatility = 0.004m
            },
            new
            {
                Base = "GBP", Quote = "JPY", BaseRate = 185.00m, MinRate = 160.00m, MaxRate = 210.00m,
                Volatility = 0.006m
            },
            new
            {
                Base = "EUR", Quote = "USD", BaseRate = 1.08m, MinRate = 0.95m, MaxRate = 1.20m, Volatility = 0.005m
            },
            new
            {
                Base = "EUR", Quote = "GBP", BaseRate = 0.87m, MinRate = 0.80m, MaxRate = 0.95m, Volatility = 0.004m
            },
            new
            {
                Base = "USD", Quote = "JPY", BaseRate = 148.00m, MinRate = 130.00m, MaxRate = 165.00m,
                Volatility = 0.006m
            },
            new
            {
                Base = "EUR", Quote = "JPY", BaseRate = 171.00m, MinRate = 150.00m, MaxRate = 190.00m,
                Volatility = 0.006m
            }
        };

        // Generate rates for each day in the range
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            // Skip weekends
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            // Skip holidays
            if (IsHoliday(date))
                continue;

            marketDates.Add(date);

            foreach (var pair in currencyPairs)
            {
                // Add some random variation to simulate market movements
                var dailyChange = (decimal)(random.NextDouble() - 0.5) * pair.Volatility;
                var currentRate = Math.Round(pair.BaseRate * (1 + dailyChange), 4);

                // Ensure rate stays within realistic bounds
                currentRate = Math.Clamp(currentRate, pair.MinRate, pair.MaxRate);

                fxRates.Add(new FxRate
                {
                    Id = Guid.NewGuid(),
                    BaseCurrency = pair.Base,
                    QuoteCurrency = pair.Quote,
                    Date = date,
                    Rate = currentRate,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        return (fxRates, marketDates);
    }

    private bool IsHoliday(DateOnly date)
    {
        // Comprehensive list of UK and US holidays
        var holidays = new[]
        {
            // UK Holidays
            new DateOnly(date.Year, 1, 1), // New Year's Day
            new DateOnly(date.Year, 12, 25), // Christmas
            new DateOnly(date.Year, 12, 26), // Boxing Day
            new DateOnly(date.Year, 4, 7), // Good Friday (approximate)
            new DateOnly(date.Year, 4, 10), // Easter Monday (approximate)
            new DateOnly(date.Year, 5, 1), // May Day
            new DateOnly(date.Year, 5, 29), // Spring Bank Holiday (approximate)
            new DateOnly(date.Year, 8, 28), // Summer Bank Holiday (approximate)

            // US Holidays
            new DateOnly(date.Year, 1, 1), // New Year's Day
            new DateOnly(date.Year, 1, 15), // Martin Luther King Jr. Day (approximate)
            new DateOnly(date.Year, 2, 19), // Presidents' Day (approximate)
            new DateOnly(date.Year, 3, 31), // Easter Monday (approximate)
            new DateOnly(date.Year, 5, 27), // Memorial Day (approximate)
            new DateOnly(date.Year, 6, 19), // Juneteenth
            new DateOnly(date.Year, 7, 4), // Independence Day
            new DateOnly(date.Year, 9, 2), // Labor Day (approximate)
            new DateOnly(date.Year, 11, 28), // Thanksgiving Day (approximate)
            new DateOnly(date.Year, 12, 25), // Christmas Day

            // European Holidays (major markets)
            new DateOnly(date.Year, 1, 1), // New Year's Day
            new DateOnly(date.Year, 5, 1), // Labour Day
            new DateOnly(date.Year, 12, 25), // Christmas
            new DateOnly(date.Year, 12, 26), // Boxing Day/St. Stephen's Day

            // Japanese Holidays
            new DateOnly(date.Year, 1, 1), // New Year's Day
            new DateOnly(date.Year, 1, 2), // Bank Holiday
            new DateOnly(date.Year, 1, 3), // Bank Holiday
            new DateOnly(date.Year, 5, 3), // Constitution Memorial Day
            new DateOnly(date.Year, 5, 4), // Greenery Day
            new DateOnly(date.Year, 5, 5), // Children's Day
            new DateOnly(date.Year, 12, 23) // Emperor's Birthday
        };

        return holidays.Contains(date);
    }

    private Task SeedCashFlows(Guid isaAccountId, Guid giaAccountId, Instrument[] instruments)
    {
        var cashFlows = new List<CashFlow>();

        // ISA Account cash flows
        cashFlows.AddRange([
            // Performance-influencing flows (keep in TWR)
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = isaAccountId,
                Date = new DateOnly(2025, 1, 15),
                Amount = 125.50m, // Dividend from AAPL
                Description = "AAPL Quarterly Dividend",
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing,
                TransactionReference = "DIV-AAPL-Q1-2025",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = isaAccountId,
                Date = new DateOnly(2025, 2, 10),
                Amount = 45.20m, // Interest on cash
                Description = "Interest on GBP Cash Holdings",
                Type = CashFlowType.InterestEarned,
                Category = CashFlowCategory.PerformanceInfluencing,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = isaAccountId,
                Date = new DateOnly(2025, 4, 15),
                Amount = 135.75m, // Another dividend
                Description = "AAPL Quarterly Dividend Q2",
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing,
                TransactionReference = "DIV-AAPL-Q2-2025",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = isaAccountId,
                Date = new DateOnly(2025, 5, 1),
                Amount = -25.00m, // Management fee
                Description = "Monthly Management Fee",
                Type = CashFlowType.ManagementFee,
                Category = CashFlowCategory.PerformanceInfluencing,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // External flows (break TWR sub-periods)
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = isaAccountId,
                Date = new DateOnly(2025, 3, 1),
                Amount = 5000.00m, // Client contribution
                Description = "Client Cash Contribution",
                Type = CashFlowType.ClientContribution,
                Category = CashFlowCategory.ExternalFlow,
                TransactionReference = "CONTRIB-2025-03-01",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        ]);

        // GIA Account cash flows
        cashFlows.AddRange([
            // Performance-influencing flows
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = giaAccountId,
                Date = new DateOnly(2025, 2, 20),
                Amount = 187.50m, // MSFT dividend
                Description = "MSFT Quarterly Dividend",
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing,
                TransactionReference = "DIV-MSFT-Q1-2025",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = giaAccountId,
                Date = new DateOnly(2025, 3, 15),
                Amount = -12.75m, // Tax withheld on dividend
                Description = "Dividend Withholding Tax",
                Type = CashFlowType.TaxWithholding,
                Category = CashFlowCategory.PerformanceInfluencing,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = giaAccountId,
                Date = new DateOnly(2025, 5, 20),
                Amount = 195.80m, // Another MSFT dividend
                Description = "MSFT Quarterly Dividend Q2",
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing,
                TransactionReference = "DIV-MSFT-Q2-2025",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // External flows (break TWR sub-periods)
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = giaAccountId,
                Date = new DateOnly(2025, 4, 1),
                Amount = -1500.00m, // Client withdrawal
                Description = "Client Withdrawal for Personal Expenses",
                Type = CashFlowType.ClientWithdrawal,
                Category = CashFlowCategory.ExternalFlow,
                TransactionReference = "WITHDRAW-2025-04-01",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },

            // Internal movements (no TWR impact)
            new CashFlow
            {
                Id = Guid.NewGuid(),
                AccountId = giaAccountId,
                Date = new DateOnly(2025, 1, 31),
                Amount = 0.00m, // Settlement adjustment
                Description = "Trade Settlement Adjustment",
                Type = CashFlowType.SettlementAdjustment,
                Category = CashFlowCategory.Internal,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        ]);

        _context.CashFlows.AddRange(cashFlows);
        return Task.CompletedTask;
    }
}
