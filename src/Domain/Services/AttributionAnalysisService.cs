namespace Domain.Services;

/// <summary>
/// Brinson-Fachler Attribution Analysis Service
/// Decomposes portfolio returns into Allocation, Selection, and Interaction effects
/// </summary>
public class AttributionAnalysisService
{
    /// <summary>
    /// Calculate attribution analysis for a portfolio vs benchmark
    /// </summary>
    public AttributionResult CalculateAttribution(
        List<PortfolioHolding> portfolioHoldings,
        List<BenchmarkHolding> benchmarkHoldings,
        decimal portfolioReturn,
        decimal benchmarkReturn)
    {
        var sectors = portfolioHoldings.Select(h => h.Sector).Union(benchmarkHoldings.Select(h => h.Sector)).Distinct().ToList();

        var sectorAttributions = new List<SectorAttribution>();
        decimal totalAllocationEffect = 0;
        decimal totalSelectionEffect = 0;
        decimal totalInteractionEffect = 0;

        foreach (var sector in sectors)
        {
            var portfolioSectorHoldings = portfolioHoldings.Where(h => h.Sector == sector).ToList();
            var benchmarkSectorHoldings = benchmarkHoldings.Where(h => h.Sector == sector).ToList();

            // Portfolio weight in sector
            var portfolioWeight = portfolioSectorHoldings.Sum(h => h.Weight);

            // Benchmark weight in sector
            var benchmarkWeight = benchmarkSectorHoldings.Sum(h => h.Weight);

            // Portfolio return in sector
            var portfolioSectorReturn = portfolioSectorHoldings.Any()
                ? portfolioSectorHoldings.Sum(h => h.Weight * h.Return) / portfolioWeight
                : 0;

            // Benchmark return in sector
            var benchmarkSectorReturn = benchmarkSectorHoldings.Any()
                ? benchmarkSectorHoldings.Sum(h => h.Weight * h.Return) / benchmarkWeight
                : 0;

            // Brinson-Fachler Attribution Effects
            // Allocation Effect: (Portfolio Weight - Benchmark Weight) × (Benchmark Sector Return - Benchmark Total Return)
            var allocationEffect = (portfolioWeight - benchmarkWeight) * (benchmarkSectorReturn - benchmarkReturn);

            // Selection Effect: Benchmark Weight × (Portfolio Sector Return - Benchmark Sector Return)
            var selectionEffect = benchmarkWeight * (portfolioSectorReturn - benchmarkSectorReturn);

            // Interaction Effect: (Portfolio Weight - Benchmark Weight) × (Portfolio Sector Return - Benchmark Sector Return)
            var interactionEffect = (portfolioWeight - benchmarkWeight) * (portfolioSectorReturn - benchmarkSectorReturn);

            sectorAttributions.Add(new SectorAttribution(
                sector,
                portfolioWeight,
                benchmarkWeight,
                portfolioSectorReturn,
                benchmarkSectorReturn,
                allocationEffect,
                selectionEffect,
                interactionEffect
            ));

            totalAllocationEffect += allocationEffect;
            totalSelectionEffect += selectionEffect;
            totalInteractionEffect += interactionEffect;
        }

        var totalAttribution = totalAllocationEffect + totalSelectionEffect + totalInteractionEffect;
        var activeReturn = portfolioReturn - benchmarkReturn;

        return new AttributionResult(
            portfolioReturn,
            benchmarkReturn,
            activeReturn,
            totalAllocationEffect,
            totalSelectionEffect,
            totalInteractionEffect,
            totalAttribution,
            sectorAttributions
        );
    }
}

public record PortfolioHolding(
    string Security,
    string Sector,
    decimal Weight,
    decimal Return
);

public record BenchmarkHolding(
    string Security,
    string Sector,
    decimal Weight,
    decimal Return
);

public record AttributionResult(
    decimal PortfolioReturn,
    decimal BenchmarkReturn,
    decimal ActiveReturn,
    decimal TotalAllocationEffect,
    decimal TotalSelectionEffect,
    decimal TotalInteractionEffect,
    decimal TotalAttribution,
    List<SectorAttribution> SectorAttributions
);

public record SectorAttribution(
    string Sector,
    decimal PortfolioWeight,
    decimal BenchmarkWeight,
    decimal PortfolioReturn,
    decimal BenchmarkReturn,
    decimal AllocationEffect,
    decimal SelectionEffect,
    decimal InteractionEffect
);
