using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolio;

public record GetPortfolioQuery(Guid? Id = null, Guid? ClientId = null) : IRequest<GetPortfolioResponse>;

public record GetPortfolioResponse(List<PortfolioDto> Portfolios);

public record PortfolioDto(
    Guid Id,
    string Name,
    Guid ClientId,
    string ClientName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int AccountCount
);
