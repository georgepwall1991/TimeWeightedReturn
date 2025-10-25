namespace Application.Services;

public class DataFreshnessSettings
{
    public const string SectionName = "DataFreshness";

    /// <summary>
    /// Number of days before instrument prices are considered stale
    /// </summary>
    public int PriceStalenessThresholdDays { get; set; } = 7;

    /// <summary>
    /// Number of days before FX rates are considered stale
    /// </summary>
    public int FxRateStalenessThresholdDays { get; set; } = 1;

    /// <summary>
    /// Number of days before benchmark prices are considered stale
    /// </summary>
    public int BenchmarkStalenessThresholdDays { get; set; } = 7;

    /// <summary>
    /// Number of days before holdings are considered stale
    /// </summary>
    public int HoldingStalenessThresholdDays { get; set; } = 30;

    /// <summary>
    /// Number of days of no account activity before warning
    /// </summary>
    public int AccountActivityThresholdDays { get; set; } = 90;
}
