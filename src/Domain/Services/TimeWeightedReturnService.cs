using Domain.ValueObjects;

namespace Domain.Services;

public class TimeWeightedReturnService
{
    /// <summary>
    /// Calculate Time Weighted Return by chaining sub-periods.
    /// Formula: TWR = ∏(1 + Ri) - 1
    /// Where Ri is the return for each sub-period
    /// </summary>
    public decimal Calculate(IEnumerable<SubPeriod> periods)
    {
        if (!periods.Any())
            throw new ArgumentException("At least one period is required", nameof(periods));

        return periods.Aggregate(1m, (accumulator, period) =>
            accumulator * (1 + period.Return)) - 1;
    }

    /// <summary>
    /// Calculate annualized return from total return and time period
    /// </summary>
    public decimal AnnualizeReturn(decimal totalReturn, int days)
    {
        if (days <= 0)
            throw new ArgumentException("Days must be positive", nameof(days));

        var years = days / 365.25m;
        return (decimal)Math.Pow((double)(1 + totalReturn), (double)(1 / years)) - 1;
    }
}
