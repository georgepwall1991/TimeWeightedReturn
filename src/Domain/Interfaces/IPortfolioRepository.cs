using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces;

public interface IPortfolioRepository
{
    Task<IEnumerable<Holding>> GetPortfolioHoldingsAsync(Guid portfolioId, DateOnly date);
    Task<IEnumerable<Holding>> GetAccountHoldingsAsync(Guid accountId, DateOnly date);
    Task<decimal> GetAccountValueAsync(Guid accountId, DateOnly date);
    Task<List<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate);

    // Tree structure queries
    Task<IEnumerable<Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null, string? userId = null);
    Task<IEnumerable<Portfolio>> GetPortfoliosWithAccountsAsync(Guid clientId);
    Task<IEnumerable<Account>> GetAccountsAsync(Guid portfolioId);
    Task<int> GetHoldingCountAsync(Guid accountId, DateOnly date);

    // Contribution analysis queries
    Task<Account?> GetAccountAsync(Guid accountId);
    Task<List<Holding>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date);

    // Attribution analysis queries
    Task<Portfolio?> GetPortfolioWithHoldingsAsync(Guid portfolioId, DateOnly date);
    Task<Benchmark?> GetBenchmarkWithHoldingsAsync(Guid benchmarkId);
    Task<decimal> GetInstrumentReturnAsync(Guid instrumentId, DateOnly startDate, DateOnly endDate);

    // Data fetching for mapping
    Task<List<Price>> GetPricesAsync(List<Guid> instrumentIds, DateOnly date);
    Task<List<FxRate>> GetFxRatesAsync(List<string> currencies, DateOnly date);
}
