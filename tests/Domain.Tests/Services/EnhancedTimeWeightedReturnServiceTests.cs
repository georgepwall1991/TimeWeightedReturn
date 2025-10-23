using Domain.Entities;
using Domain.Services;
using Domain.ValueObjects;

namespace Domain.Tests.Services;

public class EnhancedTimeWeightedReturnServiceTests
{
    private readonly EnhancedTimeWeightedReturnService _service;

    public EnhancedTimeWeightedReturnServiceTests()
    {
        _service = new EnhancedTimeWeightedReturnService();
    }

    [Fact]
    public void Calculate_WithNoExternalFlows_CalculatesSinglePeriod()
    {
        // Arrange
        var startDate = new DateOnly(2024, 1, 1);
        var endDate = new DateOnly(2024, 12, 31);
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 100000m },
            new() { Date = endDate, Value = 110000m }
        };

        var cashFlows = new List<CashFlow>(); // No cash flows

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Equal(0.10m, result.TotalReturn); // 10% return
        Assert.Single(result.SubPeriods);
        Assert.Equal(0, result.ExternalFlowCount);
        Assert.Equal(0, result.PerformanceFlowCount);
    }

    [Fact]
    public void Calculate_WithExternalFlow_BreaksIntoSubPeriods()
    {
        // Arrange
        var startDate = new DateOnly(2024, 1, 1);
        var midDate = new DateOnly(2024, 6, 15);
        var endDate = new DateOnly(2024, 12, 31);
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 100000m },
            new() { Date = new DateOnly(2024, 6, 14), Value = 105000m }, // Before external flow
            new() { Date = midDate, Value = 115000m }, // After external flow (includes 10k deposit)
            new() { Date = endDate, Value = 125000m }
        };

        var cashFlows = new List<CashFlow>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Date = midDate,
                Amount = 10000m,
                Type = CashFlowType.ClientContribution,
                Category = CashFlowCategory.ExternalFlow, // External flow breaks periods
                Description = "External deposit"
            }
        };

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Equal(2, result.SubPeriods.Count); // Two sub-periods
        Assert.Equal(1, result.ExternalFlowCount);
        Assert.Equal(0, result.PerformanceFlowCount);
    }

    [Fact]
    public void Calculate_WithPerformanceInfluencingFlow_IncludesInReturnCalculation()
    {
        // Arrange
        var startDate = new DateOnly(2024, 1, 1);
        var endDate = new DateOnly(2024, 12, 31);
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 100000m },
            new() { Date = endDate, Value = 112000m } // End value includes dividend
        };

        var cashFlows = new List<CashFlow>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Date = new DateOnly(2024, 6, 15),
                Amount = 2000m,
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing, // Performance flow affects return
                Description = "Dividend payment"
            }
        };

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Equal(0, result.ExternalFlowCount);
        Assert.Equal(1, result.PerformanceFlowCount);
        Assert.Single(result.SubPeriods);

        var subPeriod = result.SubPeriods.First();
        Assert.Single(subPeriod.PerformanceFlows);
        Assert.Equal(2000m, subPeriod.TotalPerformanceFlow);

        // Return should be (112000 - 100000 - 2000) / 100000 = 0.10 (10%)
        Assert.Equal(0.10m, result.TotalReturn);
    }

    [Fact]
    public void Calculate_WithMixedCashFlows_CategorizesProperly()
    {
        // Arrange
        var startDate = new DateOnly(2024, 1, 1);
        var midDate = new DateOnly(2024, 6, 15);
        var endDate = new DateOnly(2024, 12, 31);
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 100000m },
            new() { Date = new DateOnly(2024, 6, 14), Value = 106000m },
            new() { Date = midDate, Value = 126000m }, // After 20k external deposit
            new() { Date = endDate, Value = 133000m }
        };

        var cashFlows = new List<CashFlow>
        {
            // External flow - breaks periods
            new()
            {
                Id = Guid.NewGuid(),
                Date = midDate,
                Amount = 20000m,
                Type = CashFlowType.ClientContribution,
                Category = CashFlowCategory.ExternalFlow,
                Description = "Client deposit"
            },
            // Performance-influencing flow - affects return calculation
            new()
            {
                Id = Guid.NewGuid(),
                Date = new DateOnly(2024, 9, 15),
                Amount = 1000m,
                Type = CashFlowType.Dividend,
                Category = CashFlowCategory.PerformanceInfluencing,
                Description = "Dividend"
            },
            // Internal flow - ignored
            new()
            {
                Id = Guid.NewGuid(),
                Date = new DateOnly(2024, 10, 1),
                Amount = 5000m,
                Type = CashFlowType.InternalTransfer,
                Category = CashFlowCategory.Internal,
                Description = "Internal transfer"
            }
        };

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Equal(2, result.SubPeriods.Count); // Broken by external flow
        Assert.Equal(1, result.ExternalFlowCount);
        Assert.Equal(1, result.PerformanceFlowCount); // Only performance-influencing flow counted

        // Second sub-period should include the dividend
        var secondPeriod = result.SubPeriods.Last();
        Assert.Single(secondPeriod.PerformanceFlows);
        Assert.Equal(1000m, secondPeriod.TotalPerformanceFlow);
    }

    [Fact]
    public void Calculate_WithZeroStartValue_HandlesGracefully()
    {
        // Arrange
        var startDate = new DateOnly(2024, 1, 1);
        var endDate = new DateOnly(2024, 12, 31);
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 0m },
            new() { Date = endDate, Value = 10000m }
        };

        var cashFlows = new List<CashFlow>();

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Single(result.SubPeriods);
        Assert.Equal(0m, result.SubPeriods.First().Return); // Return is 0 when start value is 0
    }

    [Fact]
    public void Calculate_AnnualizedReturn_CalculatesCorrectly()
    {
        // Arrange - 6 month period with 10% return
        var startDate = new DateOnly(2024, 1, 1);
        var endDate = new DateOnly(2024, 7, 1); // ~182 days
        var period = new DateRange(startDate, endDate);

        var valuations = new List<ValuationPoint>
        {
            new() { Date = startDate, Value = 100000m },
            new() { Date = endDate, Value = 110000m }
        };

        var cashFlows = new List<CashFlow>();

        // Act
        var result = _service.Calculate(valuations, cashFlows, period);

        // Assert
        Assert.Equal(0.10m, result.TotalReturn);
        // Annualized return should be approximately (1.10)^(365.25/182) - 1 ≈ 21%
        Assert.True(result.AnnualizedReturn > 0.20m);
        Assert.True(result.AnnualizedReturn < 0.22m);
    }
}
