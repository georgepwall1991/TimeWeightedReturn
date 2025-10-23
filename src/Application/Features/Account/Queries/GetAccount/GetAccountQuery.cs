using MediatR;

namespace Application.Features.Account.Queries.GetAccount;

public record GetAccountQuery(Guid? Id = null, Guid? PortfolioId = null) : IRequest<GetAccountResponse>;

public record GetAccountResponse(List<AccountDto> Accounts);

public record AccountDto(
    Guid Id,
    string Name,
    string AccountNumber,
    string Currency,
    Guid PortfolioId,
    string PortfolioName,
    string ClientName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int HoldingCount,
    int CashFlowCount
);
