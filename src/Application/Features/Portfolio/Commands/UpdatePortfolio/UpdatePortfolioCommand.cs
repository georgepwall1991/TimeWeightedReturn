using MediatR;

namespace Application.Features.Portfolio.Commands.UpdatePortfolio;

public record UpdatePortfolioCommand(Guid Id, string Name, Guid? ClientId = null) : IRequest<UpdatePortfolioResponse>;

public record UpdatePortfolioResponse(
    Guid Id,
    string Name,
    Guid ClientId,
    DateTime UpdatedAt
);
