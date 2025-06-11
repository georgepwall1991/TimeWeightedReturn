using Domain.Services;

namespace Domain.Tests.Services;

public class ContributionAnalysisServiceTests
{
    private readonly ContributionAnalysisService _service;

    public ContributionAnalysisServiceTests()
    {
        _service = new ContributionAnalysisService();
    }

    [Fact]
    public void CalculateContribution_WithPositiveReturn_ReturnsCorrectContribution()
    {
        // Arrange
        decimal positionStartValue = 10000m;  // £10,000
        decimal positionEndValue = 11000m;    // £11,000
        decimal totalPortfolioStartValue = 50000m; // £50,000
        decimal totalPortfolioEndValue = 55000m;   // £55,000

        // Act
        var result = _service.CalculateContribution(positionStartValue, positionEndValue, totalPortfolioStartValue, totalPortfolioEndValue);

        // Assert
        Assert.Equal(0.2m, result.Weight); // 10,000 / 50,000 = 20%
        Assert.Equal(0.1m, result.InstrumentReturn); // (11,000 - 10,000) / 10,000 = 10%
        Assert.Equal(0.02m, result.Contribution); // 0.2 × 0.1 = 2%
        Assert.Equal(1000m, result.AbsoluteContribution); // 11,000 - 10,000 = £1,000
    }

    [Fact]
    public void CalculateContribution_WithNegativeReturn_ReturnsNegativeContribution()
    {
        // Arrange
        decimal positionStartValue = 15000m;
        decimal positionEndValue = 12000m;   // Loss of £3,000
        decimal totalPortfolioStartValue = 50000m;
        decimal totalPortfolioEndValue = 47000m;

        // Act
        var result = _service.CalculateContribution(positionStartValue, positionEndValue, totalPortfolioStartValue, totalPortfolioEndValue);

        // Assert
        Assert.Equal(0.3m, result.Weight); // 15,000 / 50,000 = 30%
        Assert.Equal(-0.2m, result.InstrumentReturn); // (12,000 - 15,000) / 15,000 = -20%
        Assert.Equal(-0.06m, result.Contribution); // 0.3 × -0.2 = -6%
        Assert.Equal(-3000m, result.AbsoluteContribution); // 12,000 - 15,000 = -£3,000
    }

    [Fact]
    public void CalculateContribution_WithZeroStartValue_ReturnsZeroContribution()
    {
        // Arrange
        decimal positionStartValue = 0m;
        decimal positionEndValue = 1000m;
        decimal totalPortfolioStartValue = 50000m;
        decimal totalPortfolioEndValue = 51000m;

        // Act
        var result = _service.CalculateContribution(positionStartValue, positionEndValue, totalPortfolioStartValue, totalPortfolioEndValue);

        // Assert
        Assert.Equal(0m, result.Weight);
        Assert.Equal(0m, result.InstrumentReturn);
        Assert.Equal(0m, result.Contribution);
        Assert.Equal(1000m, result.AbsoluteContribution);
    }

    [Fact]
    public void CalculateContribution_WithZeroPortfolioValue_ReturnsZeroValues()
    {
        // Arrange
        decimal positionStartValue = 10000m;
        decimal positionEndValue = 11000m;
        decimal totalPortfolioStartValue = 0m;
        decimal totalPortfolioEndValue = 0m;

        // Act
        var result = _service.CalculateContribution(positionStartValue, positionEndValue, totalPortfolioStartValue, totalPortfolioEndValue);

        // Assert
        Assert.Equal(0m, result.Weight);
        Assert.Equal(0m, result.InstrumentReturn);
        Assert.Equal(0m, result.Contribution);
        Assert.Equal(0m, result.AbsoluteContribution);
    }

    [Fact]
    public void CalculatePercentageContribution_WithPositiveTotal_ReturnsCorrectPercentage()
    {
        // Arrange
        decimal instrumentAbsoluteContribution = 1000m;
        decimal totalPortfolioAbsoluteReturn = 5000m;

        // Act
        var result = _service.CalculatePercentageContribution(instrumentAbsoluteContribution, totalPortfolioAbsoluteReturn);

        // Assert
        Assert.Equal(0.2m, result); // 1000 / 5000 = 20%
    }

    [Fact]
    public void CalculatePercentageContribution_WithZeroTotal_ReturnsZero()
    {
        // Arrange
        decimal instrumentAbsoluteContribution = 1000m;
        decimal totalPortfolioAbsoluteReturn = 0m;

        // Act
        var result = _service.CalculatePercentageContribution(instrumentAbsoluteContribution, totalPortfolioAbsoluteReturn);

        // Assert
        Assert.Equal(0m, result);
    }

    [Fact]
    public void CalculatePortfolioReturn_WithGrowth_ReturnsPositiveReturn()
    {
        // Arrange
        decimal startValue = 100000m;
        decimal endValue = 110000m;

        // Act
        var result = _service.CalculatePortfolioReturn(startValue, endValue);

        // Assert
        Assert.Equal(0.1m, result); // (110,000 - 100,000) / 100,000 = 10%
    }

    [Fact]
    public void CalculatePortfolioReturn_WithLoss_ReturnsNegativeReturn()
    {
        // Arrange
        decimal startValue = 100000m;
        decimal endValue = 95000m;

        // Act
        var result = _service.CalculatePortfolioReturn(startValue, endValue);

        // Assert
        Assert.Equal(-0.05m, result); // (95,000 - 100,000) / 100,000 = -5%
    }

    [Fact]
    public void GetTopAndWorstContributors_WithMultipleContributions_ReturnsCorrectExtremes()
    {
        // Arrange
        var contributions = new[]
        {
            ("AAPL", 0.03m),   // 3%
            ("GOOGL", -0.01m), // -1%
            ("MSFT", 0.05m),   // 5% (highest)
            ("VOO", 0.02m),    // 2%
            ("CASH", -0.02m)   // -2% (lowest)
        };

        // Act
        var (top, worst) = _service.GetTopAndWorstContributors(contributions);

        // Assert
        Assert.Equal("MSFT", top.Ticker);
        Assert.Equal(0.05m, top.Contribution);
        Assert.Equal("CASH", worst.Ticker);
        Assert.Equal(-0.02m, worst.Contribution);
    }

    [Fact]
    public void GetTopAndWorstContributors_WithEmptyList_ReturnsEmptyResults()
    {
        // Arrange
        var contributions = Array.Empty<(string ticker, decimal contribution)>();

        // Act
        var (top, worst) = _service.GetTopAndWorstContributors(contributions);

        // Assert
        Assert.Equal("", top.Ticker);
        Assert.Equal(0m, top.Contribution);
        Assert.Equal("", worst.Ticker);
        Assert.Equal(0m, worst.Contribution);
    }

    [Fact]
    public void GetTopAndWorstContributors_WithSingleContribution_ReturnsSameForBoth()
    {
        // Arrange
        var contributions = new[] { ("AAPL", 0.05m) };

        // Act
        var (top, worst) = _service.GetTopAndWorstContributors(contributions);

        // Assert
        Assert.Equal("AAPL", top.Ticker);
        Assert.Equal(0.05m, top.Contribution);
        Assert.Equal("AAPL", worst.Ticker);
        Assert.Equal(0.05m, worst.Contribution);
    }
}
