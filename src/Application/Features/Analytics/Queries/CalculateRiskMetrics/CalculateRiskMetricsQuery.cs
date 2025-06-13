using Application.Features.Analytics.DTOs;
using MediatR;

namespace Application.Features.Analytics.Queries.CalculateRiskMetrics;

public record CalculateRiskMetricsQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal? RiskFreeRate = null
) : IRequest<RiskMetricsAnalysisResult>;
