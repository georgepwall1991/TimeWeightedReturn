namespace Domain.Entities;

/// <summary>
/// Represents a market benchmark (e.g., S&P 500, FTSE 100) used for performance comparison
/// </summary>
public class Benchmark
{
    public Guid Id { get; set; }

    /// <summary>
    /// Benchmark name (e.g., "S&P 500", "FTSE 100")
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Index ticker symbol (e.g., "SPY", "^FTSE")
    /// </summary>
    public string IndexSymbol { get; set; } = string.Empty;

    /// <summary>
    /// Description of the benchmark
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Base currency of the benchmark
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Whether this benchmark is active and should be displayed
    /// </summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Historical price data for this benchmark
    /// </summary>
    public ICollection<BenchmarkPrice> Prices { get; set; } = new List<BenchmarkPrice>();
}
