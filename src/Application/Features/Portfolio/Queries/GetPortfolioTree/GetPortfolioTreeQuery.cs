using MediatR;
using Application.Features.Portfolio.DTOs;

namespace Application.Features.Portfolio.Queries.GetPortfolioTree;

public record GetPortfolioTreeQuery(
    Guid? ClientId = null,
    DateOnly? Date = null,
    DateOnly? MetricsStartDate = null,
    DateOnly? MetricsEndDate = null
) : IRequest<PortfolioTreeResponse>;
