using Application.Features.Analytics.DTOs;
using MediatR;

namespace Application.Features.Analytics.Queries.CalculateContribution;

public record CalculateContributionQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<ContributionAnalysisResult>;
