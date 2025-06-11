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

        // Create sample client
        var client = new Client
        {
            Id = Guid.NewGuid(),
            Name = "Smith Family Trust",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Clients.Add(client);

        // Create sample portfolio
        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            Name = "Conservative Growth Portfolio",
            ClientId = client.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.Portfolios.Add(portfolio);

        // Create sample accounts
        var account1 = new Account
        {
            Id = Guid.NewGuid(),
            Name = "ISA Account",
            AccountNumber = "ISA001",
            PortfolioId = portfolio.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var account2 = new Account
        {
            Id = Guid.NewGuid(),
            Name = "General Investment Account",
            AccountNumber = "GIA001",
            PortfolioId = portfolio.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Accounts.AddRange(account1, account2);

        // Create sample instruments
        var instruments = new[]
        {
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
            }
        };
        _context.Instruments.AddRange(instruments);

        // Create sample FX rates (GBP as base, so rate is how many quote currency per GBP)
        // Use fixed dates for consistent testing
        var sixMonthsAgo = new DateOnly(2024, 12, 11);
        var threeMonthsAgo = new DateOnly(2025, 3, 11);
        var oneMonthAgo = new DateOnly(2025, 5, 11);
        var today = new DateOnly(2025, 6, 11);

        var fxRates = new[]
        {
            // Historical rates
            new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = "GBP",
                QuoteCurrency = "USD",
                Date = sixMonthsAgo,
                Rate = 1.25m, // 1 GBP = 1.25 USD (6 months ago)
                CreatedAt = DateTime.UtcNow
            },
            new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = "GBP",
                QuoteCurrency = "USD",
                Date = threeMonthsAgo,
                Rate = 1.26m, // 1 GBP = 1.26 USD (3 months ago)
                CreatedAt = DateTime.UtcNow
            },
            new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = "GBP",
                QuoteCurrency = "USD",
                Date = oneMonthAgo,
                Rate = 1.28m, // 1 GBP = 1.28 USD (1 month ago)
                CreatedAt = DateTime.UtcNow
            },
            new FxRate
            {
                Id = Guid.NewGuid(),
                BaseCurrency = "GBP",
                QuoteCurrency = "USD",
                Date = today,
                Rate = 1.27m, // 1 GBP = 1.27 USD (today)
                CreatedAt = DateTime.UtcNow
            }
        };
        _context.FxRates.AddRange(fxRates);

        // Create sample prices for multiple dates to show returns over time
        var pricesDates = new[] { sixMonthsAgo, threeMonthsAgo, oneMonthAgo, today };
        var pricesList = new List<Price>();

        // AAPL price progression showing 15% growth over 6 months
        var aaplPrices = new[] { 152.60m, 162.40m, 170.20m, 175.50m };
        // MSFT price progression showing 12% growth over 6 months
        var msftPrices = new[] { 370.80m, 385.60m, 402.10m, 415.30m };
        // VOO price progression showing 8% growth over 6 months
        var vooPrices = new[] { 430.80m, 442.20m, 455.60m, 465.20m };

        for (int i = 0; i < pricesDates.Length; i++)
        {
            var date = pricesDates[i];

            // Security prices (showing growth over time)
            pricesList.AddRange(new[]
            {
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instruments[0].Id, // AAPL
                    Date = date,
                    Value = aaplPrices[i],
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instruments[1].Id, // MSFT
                    Date = date,
                    Value = msftPrices[i],
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instruments[2].Id, // VOO
                    Date = date,
                    Value = vooPrices[i],
                    CreatedAt = DateTime.UtcNow
                },
                // Cash always has price of 1
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instruments[3].Id, // CASH_GBP
                    Date = date,
                    Value = 1.00m,
                    CreatedAt = DateTime.UtcNow
                },
                new Price
                {
                    Id = Guid.NewGuid(),
                    InstrumentId = instruments[4].Id, // CASH_USD
                    Date = date,
                    Value = 1.00m,
                    CreatedAt = DateTime.UtcNow
                }
            });
        }

        _context.Prices.AddRange(pricesList);

        // Create sample holdings for multiple dates (same positions held throughout period)
        var holdingsList = new List<Holding>();

        foreach (var date in pricesDates)
        {
            holdingsList.AddRange(new[]
            {
                // ISA Account holdings
                new Holding
                {
                    Id = Guid.NewGuid(),
                    AccountId = account1.Id,
                    InstrumentId = instruments[0].Id, // AAPL
                    Date = date,
                    Units = 100m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Holding
                {
                    Id = Guid.NewGuid(),
                    AccountId = account1.Id,
                    InstrumentId = instruments[2].Id, // VOO
                    Date = date,
                    Units = 50m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Holding
                {
                    Id = Guid.NewGuid(),
                    AccountId = account1.Id,
                    InstrumentId = instruments[3].Id, // CASH_GBP
                    Date = date,
                    Units = 5000m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                // GIA Account holdings
                new Holding
                {
                    Id = Guid.NewGuid(),
                    AccountId = account2.Id,
                    InstrumentId = instruments[1].Id, // MSFT
                    Date = date,
                    Units = 75m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Holding
                {
                    Id = Guid.NewGuid(),
                    AccountId = account2.Id,
                    InstrumentId = instruments[4].Id, // CASH_USD
                    Date = date,
                    Units = 2000m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            });
        }

        _context.Holdings.AddRange(holdingsList);

        // Seed sample cash flows to demonstrate TWR calculation with flows
        await SeedCashFlows(account1.Id, account2.Id, instruments);

        await _context.SaveChangesAsync();
    }

    private async Task SeedCashFlows(Guid isaAccountId, Guid giaAccountId, Instrument[] instruments)
    {
        var cashFlows = new List<CashFlow>();

        // ISA Account cash flows
        cashFlows.AddRange(new[]
        {
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
        });

        // GIA Account cash flows
        cashFlows.AddRange(new[]
        {
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
        });

        _context.CashFlows.AddRange(cashFlows);
    }
}
