namespace Domain.ValueObjects;

/// <summary>
///     Defines tolerance levels for reconciliation matching
/// </summary>
public class MatchingTolerance
{
    /// <summary>
    ///     Tolerance for amount matching (absolute value)
    /// </summary>
    public decimal AmountTolerance { get; set; } = 0.01m; // 1 penny

    /// <summary>
    ///     Tolerance for percentage-based matching
    /// </summary>
    public decimal PercentageTolerance { get; set; } = 0.0001m; // 0.01%

    /// <summary>
    ///     Tolerance for quantity/units matching
    /// </summary>
    public decimal QuantityTolerance { get; set; } = 0.000001m; // 6 decimal places

    /// <summary>
    ///     Tolerance for price matching
    /// </summary>
    public decimal PriceTolerance { get; set; } = 0.01m; // 1 penny

    /// <summary>
    ///     Price variance percentage threshold (e.g., 5% = 0.05)
    /// </summary>
    public decimal PriceVarianceThreshold { get; set; } = 0.05m; // 5%

    /// <summary>
    ///     Date tolerance in days (for near-match scenarios)
    /// </summary>
    public int DateToleranceDays { get; set; } = 0; // Exact match by default

    /// <summary>
    ///     Checks if two amounts match within tolerance
    /// </summary>
    public bool AmountsMatch(decimal amount1, decimal amount2)
    {
        var difference = Math.Abs(amount1 - amount2);
        return difference <= AmountTolerance;
    }

    /// <summary>
    ///     Checks if two quantities match within tolerance
    /// </summary>
    public bool QuantitiesMatch(decimal qty1, decimal qty2)
    {
        var difference = Math.Abs(qty1 - qty2);
        return difference <= QuantityTolerance;
    }

    /// <summary>
    ///     Checks if two prices match within tolerance
    /// </summary>
    public bool PricesMatch(decimal price1, decimal price2)
    {
        var absoluteDifference = Math.Abs(price1 - price2);
        if (absoluteDifference <= PriceTolerance)
            return true;

        // Also check percentage variance
        var percentageVariance = price2 != 0 ? Math.Abs((price1 - price2) / price2) : 0;
        return percentageVariance <= PriceVarianceThreshold;
    }

    /// <summary>
    ///     Checks if two dates match within tolerance
    /// </summary>
    public bool DatesMatch(DateOnly date1, DateOnly date2)
    {
        var daysDifference = Math.Abs((date1.ToDateTime(TimeOnly.MinValue) - date2.ToDateTime(TimeOnly.MinValue)).Days);
        return daysDifference <= DateToleranceDays;
    }

    /// <summary>
    ///     Default strict tolerance (no variance allowed)
    /// </summary>
    public static MatchingTolerance Strict => new()
    {
        AmountTolerance = 0m,
        PercentageTolerance = 0m,
        QuantityTolerance = 0m,
        PriceTolerance = 0m,
        PriceVarianceThreshold = 0m,
        DateToleranceDays = 0
    };

    /// <summary>
    ///     Standard tolerance for most reconciliations
    /// </summary>
    public static MatchingTolerance Standard => new()
    {
        AmountTolerance = 0.01m,
        PercentageTolerance = 0.0001m,
        QuantityTolerance = 0.000001m,
        PriceTolerance = 0.01m,
        PriceVarianceThreshold = 0.01m, // 1%
        DateToleranceDays = 0
    };

    /// <summary>
    ///     Relaxed tolerance for scenarios with known rounding differences
    /// </summary>
    public static MatchingTolerance Relaxed => new()
    {
        AmountTolerance = 0.10m, // 10 cents
        PercentageTolerance = 0.001m, // 0.1%
        QuantityTolerance = 0.00001m,
        PriceTolerance = 0.05m,
        PriceVarianceThreshold = 0.05m, // 5%
        DateToleranceDays = 1
    };
}
