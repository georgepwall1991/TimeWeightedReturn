using Domain.Services;
using Domain.ValueObjects;

namespace Domain.Tests.Services;

public class TimeWeightedReturnServiceTests
{
    private readonly TimeWeightedReturnService _service;

    public TimeWeightedReturnServiceTests()
    {
        _service = new TimeWeightedReturnService();
    }

    [Fact]
    public void Calculate_EmptyPeriods_ThrowsArgumentException()
    {
        // Arrange
        var periods = Enumerable.Empty<SubPeriod>();

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.Calculate(periods));
    }

    [Theory]
    [InlineData(100, 110, 0, 0.10)] // Simple 10% return
    [InlineData(100, 120, 10, 0.10)] // 10% return with £10 inflow
    [InlineData(100, 95, -5, 0.00)] // No return: end value 95, but -5 outflow means actual performance = 0
    [InlineData(100, 80, 0, -0.20)] // -20% return, no flows
    [InlineData(1000, 1150, 50, 0.10)] // 10% return with £50 inflow (larger numbers)
    public void Calculate_SinglePeriod_ReturnsExpected(
        decimal startValue, decimal endValue, decimal netFlow, decimal expectedReturn)
    {
        // Arrange
        var period = new SubPeriod(startValue, endValue, netFlow);
        var periods = new[] { period };

        // Act
        var result = _service.Calculate(periods);

        // Assert
        Assert.Equal(expectedReturn, result, 4);
    }

    [Fact]
    public void Calculate_MultiplePeriods_ChainReturnsCorrectly()
    {
        // Arrange - Two periods with 10% return each should give ~21% total
        var period1 = new SubPeriod(100m, 110m, 0m); // 10% return
        var period2 = new SubPeriod(110m, 121m, 0m); // 10% return
        var periods = new[] { period1, period2 };

        // Act
        var result = _service.Calculate(periods);

        // Assert - (1.10 * 1.10) - 1 = 0.21
        Assert.Equal(0.21m, result, 4);
    }

    [Fact]
    public void Calculate_MixedReturns_ChainCorrectly()
    {
        // Arrange - Mix of positive and negative returns
        var period1 = new SubPeriod(100m, 120m, 0m); // 20% return
        var period2 = new SubPeriod(120m, 108m, 0m); // -10% return
        var periods = new[] { period1, period2 };

        // Act
        var result = _service.Calculate(periods);

        // Assert - (1.20 * 0.90) - 1 = 0.08 (8% total)
        Assert.Equal(0.08m, result, 4);
    }

    [Theory]
    [InlineData(0.10, 365, 0.10)] // 10% return over 1 year = 10% annualized
    [InlineData(0.21, 730, 0.10)] // 21% return over 2 years ≈ 10% annualized
    [InlineData(0.05, 182, 0.1029)] // 5% return over 6 months ≈ 10.29% annualized
    public void AnnualizeReturn_VariousPeriods_CalculatesCorrectly(
        decimal totalReturn, int days, decimal expectedAnnualized)
    {
        // Act
        var result = _service.AnnualizeReturn(totalReturn, days);

        // Assert
        Assert.Equal(expectedAnnualized, result, 3);
    }

    [Fact]
    public void AnnualizeReturn_ZeroDays_ThrowsArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.AnnualizeReturn(0.10m, 0));
    }

    [Fact]
    public void AnnualizeReturn_NegativeDays_ThrowsArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() => _service.AnnualizeReturn(0.10m, -10));
    }
}
