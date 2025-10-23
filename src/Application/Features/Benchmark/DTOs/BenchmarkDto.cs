namespace Application.Features.Benchmark.DTOs;

public class BenchmarkDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IndexSymbol { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Currency { get; set; } = "USD";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BenchmarkPriceDto
{
    public Guid Id { get; set; }
    public Guid BenchmarkId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
    public decimal? DailyReturn { get; set; }
}

public class BenchmarkComparisonDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public Guid BenchmarkId { get; set; }
    public string BenchmarkName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    public decimal PortfolioReturn { get; set; }
    public decimal BenchmarkReturn { get; set; }
    public decimal ActiveReturn { get; set; }
    public decimal TrackingError { get; set; }

    public List<DailyComparisonDto> DailyComparisons { get; set; } = new();
}

public class DailyComparisonDto
{
    public DateOnly Date { get; set; }
    public decimal PortfolioValue { get; set; }
    public decimal BenchmarkValue { get; set; }
    public decimal PortfolioCumulativeReturn { get; set; }
    public decimal BenchmarkCumulativeReturn { get; set; }
}
