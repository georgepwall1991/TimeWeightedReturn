namespace Domain.Entities;

/// <summary>
/// Historical price data for a benchmark index
/// </summary>
public class BenchmarkPrice
{
    public Guid Id { get; set; }

    public Guid BenchmarkId { get; set; }
    public Benchmark Benchmark { get; set; } = null!;

    /// <summary>
    /// Date of the price
    /// </summary>
    public DateOnly Date { get; set; }

    /// <summary>
    /// Closing value/level of the benchmark index
    /// </summary>
    public decimal Value { get; set; }

    /// <summary>
    /// Daily return percentage (optional, can be calculated)
    /// </summary>
    public decimal? DailyReturn { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
