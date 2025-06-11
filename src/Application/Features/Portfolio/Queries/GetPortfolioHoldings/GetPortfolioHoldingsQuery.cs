using MediatR;
using Application.Features.Portfolio.DTOs;

namespace Application.Features.Portfolio.Queries.GetPortfolioHoldings;

public record GetPortfolioHoldingsQuery(Guid PortfolioId, DateOnly Date) : IRequest<GetPortfolioHoldingsResponse>;
