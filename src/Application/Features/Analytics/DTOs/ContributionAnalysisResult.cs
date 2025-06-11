namespace Application.Features.Analytics.DTOs;

public record ContributionAnalysisResult
{
    public Guid AccountId { get; init; }
    public string AccountName { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public int Days { get; init; }

    // Portfolio-level metrics
    public decimal TotalPortfolioReturn { get; init; }
    public decimal AnnualizedReturn { get; init; }
    public decimal StartValueGBP { get; init; }
    public decimal EndValueGBP { get; init; }

    // Individual instrument contributions
    public IReadOnlyList<ContributionData> InstrumentContributions { get; init; } = Array.Empty<ContributionData>();

    // Summary statistics
    public decimal TopContributorReturn { get; init; }
    public decimal WorstContributorReturn { get; init; }
    public string TopContributorTicker { get; init; } = string.Empty;
    public string WorstContributorTicker { get; init; } = string.Empty;
};

public record ContributionData
{
    public string InstrumentId { get; init; } = string.Empty;
    public string Ticker { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Currency { get; init; } = string.Empty;
    public InstrumentType Type { get; init; }

    // Position data
    public decimal Units { get; init; }
    public decimal StartPrice { get; init; }
    public decimal EndPrice { get; init; }
    public decimal StartValueGBP { get; init; }
    public decimal EndValueGBP { get; init; }

    // Weight and return calculations
    public decimal Weight { get; init; }              // Position weight at start of period
    public decimal InstrumentReturn { get; init; }    // Return of this instrument
    public decimal Contribution { get; init; }        // Weight × Return = contribution to portfolio

    // Performance metrics
    public decimal AbsoluteContribution { get; init; } // Absolute GBP contribution
    public decimal PercentageContribution { get; init; } // % of total portfolio return
}

public enum InstrumentType
{
    Cash = 0,
    Security = 1
}
