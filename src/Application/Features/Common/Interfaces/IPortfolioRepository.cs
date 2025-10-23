using Application.Features.Portfolio.DTOs;
using Domain.Entities;

namespace Application.Features.Common.Interfaces;

public interface IPortfolioRepository
{
    Task<IEnumerable<HoldingDto>> GetPortfolioHoldingsAsync(Guid portfolioId, DateOnly date);
    Task<IEnumerable<HoldingDto>> GetAccountHoldingsAsync(Guid accountId, DateOnly date);
    Task<decimal> GetAccountValueAsync(Guid accountId, DateOnly date);
    Task<List<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate);

    // Tree structure queries
    Task<IEnumerable<Domain.Entities.Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null);
    Task<IEnumerable<Domain.Entities.Portfolio>> GetPortfoliosWithAccountsAsync(Guid clientId);
    Task<IEnumerable<Domain.Entities.Account>> GetAccountsAsync(Guid portfolioId);
    Task<int> GetHoldingCountAsync(Guid accountId, DateOnly date);

    // Contribution analysis queries
    Task<Domain.Entities.Account?> GetAccountAsync(Guid accountId);
    Task<List<HoldingDto>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date);
}
