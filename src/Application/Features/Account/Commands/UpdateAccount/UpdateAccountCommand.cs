using MediatR;

namespace Application.Features.Account.Commands.UpdateAccount;

public record UpdateAccountCommand(
    Guid Id,
    string Name,
    string AccountNumber,
    string Currency,
    Guid? PortfolioId = null
) : IRequest<UpdateAccountResponse>;

public record UpdateAccountResponse(
    Guid Id,
    string Name,
    string AccountNumber,
    string Currency,
    Guid PortfolioId,
    DateTime UpdatedAt
);
