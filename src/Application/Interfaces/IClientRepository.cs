namespace Application.Interfaces;

public interface IClientRepository
{
    Task<Domain.Entities.Client?> GetClientByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Client>> GetAllClientsAsync(CancellationToken cancellationToken = default);
    Task<Domain.Entities.Client?> GetClientByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Client> CreateClientAsync(Domain.Entities.Client client, CancellationToken cancellationToken = default);
    Task UpdateClientAsync(Domain.Entities.Client client, CancellationToken cancellationToken = default);
    Task DeleteClientAsync(Domain.Entities.Client client, CancellationToken cancellationToken = default);
    Task<bool> ClientExistsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IPortfolioManagementRepository
{
    Task<Domain.Entities.Portfolio?> GetPortfolioByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Portfolio>> GetAllPortfoliosAsync(Guid? clientId = null, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Portfolio?> GetPortfolioByNameAndClientAsync(string name, Guid clientId, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Portfolio> CreatePortfolioAsync(Domain.Entities.Portfolio portfolio, CancellationToken cancellationToken = default);
    Task UpdatePortfolioAsync(Domain.Entities.Portfolio portfolio, CancellationToken cancellationToken = default);
    Task DeletePortfolioAsync(Domain.Entities.Portfolio portfolio, CancellationToken cancellationToken = default);
    Task<bool> PortfolioExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ClientExistsAsync(Guid clientId, CancellationToken cancellationToken = default);
}

public interface IAccountRepository
{
    Task<Domain.Entities.Account?> GetAccountByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.Account>> GetAllAccountsAsync(Guid? portfolioId = null, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Account?> GetAccountByAccountNumberAsync(string accountNumber, CancellationToken cancellationToken = default);
    Task<Domain.Entities.Account> CreateAccountAsync(Domain.Entities.Account account, CancellationToken cancellationToken = default);
    Task UpdateAccountAsync(Domain.Entities.Account account, CancellationToken cancellationToken = default);
    Task DeleteAccountAsync(Domain.Entities.Account account, CancellationToken cancellationToken = default);
    Task<bool> AccountExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> PortfolioExistsAsync(Guid portfolioId, CancellationToken cancellationToken = default);
}

public interface ICashFlowRepository
{
    Task<Domain.Entities.CashFlow?> GetCashFlowByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<Domain.Entities.CashFlow>> GetCashFlowsAsync(
        Guid? accountId = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        Domain.Entities.CashFlowCategory? category = null,
        CancellationToken cancellationToken = default);
    Task<Domain.Entities.CashFlow> CreateCashFlowAsync(Domain.Entities.CashFlow cashFlow, CancellationToken cancellationToken = default);
    Task UpdateCashFlowAsync(Domain.Entities.CashFlow cashFlow, CancellationToken cancellationToken = default);
    Task DeleteCashFlowAsync(Domain.Entities.CashFlow cashFlow, CancellationToken cancellationToken = default);
    Task<bool> AccountExistsAsync(Guid accountId, CancellationToken cancellationToken = default);
}
