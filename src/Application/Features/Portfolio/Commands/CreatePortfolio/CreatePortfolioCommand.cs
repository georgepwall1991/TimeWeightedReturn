using MediatR;

namespace Application.Features.Portfolio.Commands.CreatePortfolio;

public record CreatePortfolioCommand(string Name, Guid ClientId) : IRequest<CreatePortfolioResponse>;

public record CreatePortfolioResponse(
    Guid Id,
    string Name,
    Guid ClientId,
    DateTime CreatedAt
);
