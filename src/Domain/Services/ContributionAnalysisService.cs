namespace Domain.Services;

public class ContributionAnalysisService
{
    /// <summary>
    ///     Calculate contribution analysis for a portfolio position
    ///     Formula: Contribution = Weight × Return
    ///     Where Weight = (Start Value / Total Portfolio Value) and Return = (End Value - Start Value) / Start Value
    /// </summary>
    public ContributionResult CalculateContribution(
        decimal positionStartValue,
        decimal positionEndValue,
        decimal totalPortfolioStartValue,
        decimal totalPortfolioEndValue)
    {
        if (totalPortfolioStartValue <= 0) return new ContributionResult(0, 0, 0, 0);

        // Calculate position weight at start of period
        var weight = positionStartValue / totalPortfolioStartValue;

        // Calculate instrument return
        var instrumentReturn = positionStartValue > 0
            ? (positionEndValue - positionStartValue) / positionStartValue
            : 0;

        // Calculate contribution to portfolio return
        var contribution = weight * instrumentReturn;

        // Calculate absolute contribution in currency terms
        var absoluteContribution = positionEndValue - positionStartValue;

        return new ContributionResult(weight, instrumentReturn, contribution, absoluteContribution);
    }

    /// <summary>
    ///     Calculate the percentage that each instrument's contribution represents of the total portfolio return
    /// </summary>
    public decimal CalculatePercentageContribution(
        decimal instrumentAbsoluteContribution,
        decimal totalPortfolioAbsoluteReturn)
    {
        if (totalPortfolioAbsoluteReturn == 0)
            return 0;

        return instrumentAbsoluteContribution / totalPortfolioAbsoluteReturn;
    }

    /// <summary>
    ///     Calculate portfolio-level return for comparison
    /// </summary>
    public decimal CalculatePortfolioReturn(decimal startValue, decimal endValue)
    {
        if (startValue <= 0)
            return 0;

        return (endValue - startValue) / startValue;
    }

    /// <summary>
    ///     Identify top and worst contributors from a list of contributions
    /// </summary>
    public (ContributionSummary top, ContributionSummary worst) GetTopAndWorstContributors(
        IEnumerable<(string ticker, decimal contribution)> contributions)
    {
        var contributionList = contributions.ToList();

        if (!contributionList.Any()) return (new ContributionSummary("", 0), new ContributionSummary("", 0));

        var top = contributionList.OrderByDescending(c => c.contribution).First();
        var worst = contributionList.OrderBy(c => c.contribution).First();

        return (new ContributionSummary(top.ticker, top.contribution),
            new ContributionSummary(worst.ticker, worst.contribution));
    }
}

public record ContributionResult(
    decimal Weight,
    decimal InstrumentReturn,
    decimal Contribution,
    decimal AbsoluteContribution);

public record ContributionSummary(
    string Ticker,
    decimal Contribution);
