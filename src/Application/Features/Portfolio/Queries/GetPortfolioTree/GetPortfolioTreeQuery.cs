using Application.Features.Portfolio.DTOs;
using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolioTree;

public record GetPortfolioTreeQuery(
    Guid? ClientId = null,
    DateOnly? Date = null,
    DateOnly? MetricsStartDate = null,
    DateOnly? MetricsEndDate = null,
    string? UserId = null
) : IRequest<PortfolioTreeResponse>;
