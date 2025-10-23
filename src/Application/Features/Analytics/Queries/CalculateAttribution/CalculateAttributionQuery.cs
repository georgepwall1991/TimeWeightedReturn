using MediatR;

namespace Application.Features.Analytics.Queries.CalculateAttribution;

public record CalculateAttributionQuery(
    Guid AccountId,
    DateOnly StartDate,
    DateOnly EndDate,
    string BenchmarkTicker = "SPY" // Default to S&P 500 ETF
) : IRequest<AttributionAnalysisResponse>;

public record AttributionAnalysisResponse(
    decimal PortfolioReturn,
    decimal BenchmarkReturn,
    decimal ActiveReturn,
    decimal TotalAllocationEffect,
    decimal TotalSelectionEffect,
    decimal TotalInteractionEffect,
    decimal TotalAttribution,
    List<SectorAttributionDto> SectorAttributions
);

public record SectorAttributionDto(
    string Sector,
    decimal PortfolioWeight,
    decimal BenchmarkWeight,
    decimal PortfolioReturn,
    decimal BenchmarkReturn,
    decimal AllocationEffect,
    decimal SelectionEffect,
    decimal InteractionEffect
);
