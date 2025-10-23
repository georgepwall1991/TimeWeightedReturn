using MediatR;

namespace Application.Features.Analytics.Queries.CalculateEnhancedTwr;

public record CalculateEnhancedTwrQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<EnhancedTwrResponse>;

public record EnhancedTwrResponse(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal TimeWeightedReturn,
    decimal AnnualizedReturn,
    int Days,
    int NumberOfSubPeriods,
    decimal StartValue,
    decimal EndValue,
    int ExternalFlowCount,
    int PerformanceFlowCount,
    List<SubPeriodDetailDto> SubPeriods
);

public record SubPeriodDetailDto(
    DateOnly StartDate,
    DateOnly EndDate,
    decimal StartValue,
    decimal EndValue,
    decimal Return,
    int Days,
    decimal TotalPerformanceFlow,
    List<CashFlowDetailDto> PerformanceFlows
);

public record CashFlowDetailDto(
    DateOnly Date,
    decimal Amount,
    string Type,
    string Description
);
