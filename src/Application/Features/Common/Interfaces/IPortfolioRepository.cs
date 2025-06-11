using Application.Features.Common.DTOs;
using Domain.Entities;

namespace Application.Features.Common.Interfaces;

public interface IPortfolioRepository
{
    Task<IEnumerable<HoldingDto>> GetPortfolioHoldingsAsync(Guid portfolioId, DateOnly date);
    Task<IEnumerable<HoldingDto>> GetAccountHoldingsAsync(Guid accountId, DateOnly date);
    Task<decimal> GetAccountValueAsync(Guid accountId, DateOnly date);
    Task<IEnumerable<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate);

    // Tree structure queries
    Task<IEnumerable<Client>> GetClientsWithPortfoliosAsync(Guid? clientId = null);
    Task<IEnumerable<Domain.Entities.Portfolio>> GetPortfoliosWithAccountsAsync(Guid clientId);
    Task<IEnumerable<Account>> GetAccountsAsync(Guid portfolioId);
    Task<int> GetHoldingCountAsync(Guid accountId, DateOnly date);

    // Contribution analysis queries
    Task<Account?> GetAccountAsync(Guid accountId);
    Task<IEnumerable<HoldingDto>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date);
}
