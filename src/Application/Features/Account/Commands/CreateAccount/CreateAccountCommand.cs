using MediatR;

namespace Application.Features.Account.Commands.CreateAccount;

public record CreateAccountCommand(
    string Name,
    string AccountNumber,
    string Currency,
    Guid PortfolioId
) : IRequest<CreateAccountResponse>;

public record CreateAccountResponse(
    Guid Id,
    string Name,
    string AccountNumber,
    string Currency,
    Guid PortfolioId,
    DateTime CreatedAt
);
