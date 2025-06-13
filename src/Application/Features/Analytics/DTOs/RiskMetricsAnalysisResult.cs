namespace Application.Features.Analytics.DTOs;

public record RiskMetricsAnalysisResult
{
    public Guid AccountId { get; init; }
    public string AccountName { get; init; } = string.Empty;
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public int Days { get; init; }

    // Core Risk Metrics
    public decimal AnnualizedVolatility { get; init; }
    public decimal SharpeRatio { get; init; }
    public decimal MaximumDrawdown { get; init; }
    public decimal CurrentDrawdown { get; init; }
    public decimal ValueAtRisk95 { get; init; }
    public decimal AnnualizedReturn { get; init; }

    // Additional Analysis
    public decimal RiskFreeRate { get; init; }
    public string RiskProfile { get; init; } = string.Empty; // Conservative, Moderate, Aggressive
    public IReadOnlyList<DrawdownPeriodData> DrawdownPeriods { get; init; } = [];
    public IReadOnlyList<RollingVolatilityData> RollingVolatility { get; init; } = [];

    // Risk Assessment
    public RiskAssessment RiskAssessment { get; init; } = new();
}

public record DrawdownPeriodData
{
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal MaxDrawdown { get; init; }
    public int DurationDays { get; init; }
    public bool IsRecovered { get; init; }
}

public record RollingVolatilityData
{
    public DateOnly Date { get; init; }
    public decimal AnnualizedVolatility { get; init; }
}

public record RiskAssessment
{
    public string VolatilityCategory { get; init; } = string.Empty; // Low, Medium, High
    public string SharpeCategory { get; init; } = string.Empty; // Poor, Fair, Good, Excellent
    public string DrawdownCategory { get; init; } = string.Empty; // Minimal, Moderate, Severe
    public decimal RiskScore { get; init; } // 1-10 scale
    public string OverallAssessment { get; init; } = string.Empty;
    public IReadOnlyList<string> RiskWarnings { get; init; } = [];
    public IReadOnlyList<string> PositiveFactors { get; init; } = [];
}
