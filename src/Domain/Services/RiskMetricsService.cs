namespace Domain.Services;

public class RiskMetricsService
{
    private const decimal RISK_FREE_RATE = 0.02m; // 2% annual risk-free rate (configurable)

    /// <summary>
    ///     Calculate comprehensive risk metrics for a series of portfolio values
    /// </summary>
    public RiskMetricsResult CalculateRiskMetrics(
        IEnumerable<decimal> portfolioValues,
        IEnumerable<DateOnly> dates,
        decimal riskFreeRate = RISK_FREE_RATE)
    {
        var valuesList = portfolioValues.ToList();
        var datesList = dates.ToList();

        if (valuesList.Count < 2 || datesList.Count != valuesList.Count)
            return new RiskMetricsResult(0, 0, 0, 0, 0, 0, Array.Empty<DrawdownPeriod>());

        // Calculate daily returns
        var returns = CalculateReturns(valuesList);

        // Basic metrics
        var volatility = CalculateVolatility(returns);
        var annualizedVolatility = AnnualizeVolatility(volatility, datesList);
        var meanReturn = returns.Average();
        var annualizedReturn = AnnualizeReturn(meanReturn, datesList);

        // Risk-adjusted metrics
        var sharpeRatio = CalculateSharpeRatio(annualizedReturn, annualizedVolatility, riskFreeRate);

        // Drawdown analysis
        var (maxDrawdown, currentDrawdown, drawdownPeriods) = CalculateDrawdownMetrics(valuesList, datesList);

        // Value at Risk (95% confidence)
        var valueAtRisk = CalculateValueAtRisk(returns, 0.95m);

        return new RiskMetricsResult(
            annualizedVolatility,
            sharpeRatio,
            maxDrawdown,
            currentDrawdown,
            valueAtRisk,
            annualizedReturn,
            drawdownPeriods);
    }

    /// <summary>
    ///     Calculate daily returns from portfolio values
    /// </summary>
    private List<decimal> CalculateReturns(List<decimal> values)
    {
        var returns = new List<decimal>();

        for (var i = 1; i < values.Count; i++)
            if (values[i - 1] > 0)
            {
                var dailyReturn = (values[i] - values[i - 1]) / values[i - 1];
                returns.Add(dailyReturn);
            }

        return returns;
    }

    /// <summary>
    ///     Calculate volatility (standard deviation of returns)
    /// </summary>
    private decimal CalculateVolatility(List<decimal> returns)
    {
        if (returns.Count < 2) return 0;

        var mean = returns.Average();
        var squaredDifferences = returns.Select(r => (r - mean) * (r - mean));
        var variance = squaredDifferences.Average();

        return (decimal)Math.Sqrt((double)variance);
    }

    /// <summary>
    ///     Annualize volatility based on the time period
    /// </summary>
    private decimal AnnualizeVolatility(decimal volatility, List<DateOnly> dates)
    {
        if (dates.Count < 2) return volatility;

        var totalDays = dates.Last().DayNumber - dates.First().DayNumber;
        var annualizationFactor = (decimal)Math.Sqrt(365.25 / Math.Max(totalDays / (dates.Count - 1), 1));

        return volatility * annualizationFactor;
    }

    /// <summary>
    ///     Annualize return based on the time period
    /// </summary>
    private decimal AnnualizeReturn(decimal meanReturn, List<DateOnly> dates)
    {
        if (dates.Count < 2) return meanReturn;

        var totalDays = dates.Last().DayNumber - dates.First().DayNumber;
        var periodsPerYear = 365.25m / Math.Max(totalDays / (dates.Count - 1), 1);

        return meanReturn * periodsPerYear;
    }

    /// <summary>
    ///     Calculate Sharpe Ratio (risk-adjusted return)
    ///     Formula: (Portfolio Return - Risk Free Rate) / Portfolio Volatility
    /// </summary>
    private decimal CalculateSharpeRatio(decimal portfolioReturn, decimal volatility, decimal riskFreeRate)
    {
        if (volatility == 0) return 0;
        return (portfolioReturn - riskFreeRate) / volatility;
    }

    /// <summary>
    ///     Calculate drawdown metrics including maximum drawdown and all drawdown periods
    /// </summary>
    private (decimal maxDrawdown, decimal currentDrawdown, IReadOnlyList<DrawdownPeriod> periods)
        CalculateDrawdownMetrics(List<decimal> values, List<DateOnly> dates)
    {
        var drawdownPeriods = new List<DrawdownPeriod>();
        var peak = values[0];
        var peakDate = dates[0];
        var maxDrawdown = 0m;
        var currentDrawdownStart = (DateOnly?)null;
        var currentMaxDrawdownInPeriod = 0m;

        for (var i = 1; i < values.Count; i++)
        {
            var currentValue = values[i];
            var currentDate = dates[i];

            if (currentValue > peak)
            {
                // New peak reached - end any current drawdown period
                if (currentDrawdownStart.HasValue)
                {
                    drawdownPeriods.Add(new DrawdownPeriod(
                        currentDrawdownStart.Value,
                        dates[i - 1],
                        currentMaxDrawdownInPeriod,
                        dates[i - 1].DayNumber - currentDrawdownStart.Value.DayNumber + 1));

                    currentDrawdownStart = null;
                    currentMaxDrawdownInPeriod = 0m;
                }

                peak = currentValue;
                peakDate = currentDate;
            }
            else
            {
                // We're in a drawdown
                var drawdown = (peak - currentValue) / peak;

                if (!currentDrawdownStart.HasValue) currentDrawdownStart = peakDate;

                currentMaxDrawdownInPeriod = Math.Max(currentMaxDrawdownInPeriod, drawdown);
                maxDrawdown = Math.Max(maxDrawdown, drawdown);
            }
        }

        // Handle ongoing drawdown at the end
        if (currentDrawdownStart.HasValue)
            drawdownPeriods.Add(new DrawdownPeriod(
                currentDrawdownStart.Value,
                dates.Last(),
                currentMaxDrawdownInPeriod,
                dates.Last().DayNumber - currentDrawdownStart.Value.DayNumber + 1));

        var currentDrawdown = values.Last() < peak ? (peak - values.Last()) / peak : 0m;

        return (maxDrawdown, currentDrawdown, drawdownPeriods);
    }

    /// <summary>
    ///     Calculate Value at Risk (VaR) at specified confidence level
    /// </summary>
    private decimal CalculateValueAtRisk(List<decimal> returns, decimal confidenceLevel)
    {
        if (returns.Count == 0) return 0;

        var sortedReturns = returns.OrderBy(r => r).ToList();
        var index = (int)Math.Floor((1 - confidenceLevel) * sortedReturns.Count);
        index = Math.Max(0, Math.Min(index, sortedReturns.Count - 1));

        return Math.Abs(sortedReturns[index]); // Return as positive value
    }

    /// <summary>
    ///     Calculate rolling volatility for time series analysis
    /// </summary>
    public IEnumerable<RollingVolatilityPoint> CalculateRollingVolatility(
        IEnumerable<decimal> values,
        IEnumerable<DateOnly> dates,
        int windowDays = 30)
    {
        var valuesList = values.ToList();
        var datesList = dates.ToList();
        var returns = CalculateReturns(valuesList);
        var result = new List<RollingVolatilityPoint>();

        for (var i = windowDays; i < returns.Count; i++)
        {
            var windowReturns = returns.Skip(i - windowDays).Take(windowDays).ToList();
            var volatility = CalculateVolatility(windowReturns);
            var annualizedVol = volatility * (decimal)Math.Sqrt(365.25);

            result.Add(new RollingVolatilityPoint(datesList[i], annualizedVol));
        }

        return result;
    }
}

public record RiskMetricsResult(
    decimal AnnualizedVolatility,
    decimal SharpeRatio,
    decimal MaximumDrawdown,
    decimal CurrentDrawdown,
    decimal ValueAtRisk95,
    decimal AnnualizedReturn,
    IReadOnlyList<DrawdownPeriod> DrawdownPeriods);

public record DrawdownPeriod(
    DateOnly StartDate,
    DateOnly EndDate,
    decimal MaxDrawdown,
    int DurationDays);

public record RollingVolatilityPoint(
    DateOnly Date,
    decimal AnnualizedVolatility);
