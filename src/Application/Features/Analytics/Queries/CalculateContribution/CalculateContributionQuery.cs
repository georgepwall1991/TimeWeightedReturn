using MediatR;
using Application.Features.Analytics.DTOs;

namespace Application.Features.Analytics.Queries.CalculateContribution;

public record CalculateContributionQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<ContributionAnalysisResult>;
