using MediatR;
using Application.Features.Analytics.DTOs;

namespace Application.Features.Analytics.Queries.CalculateTwr;

public record CalculateTwrQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<TwrResult>;
