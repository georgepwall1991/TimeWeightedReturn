using Application.Features.Portfolio.DTOs;
using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolioHoldings;

public record GetPortfolioHoldingsQuery(Guid PortfolioId, DateOnly Date) : IRequest<GetPortfolioHoldingsResponse>;
