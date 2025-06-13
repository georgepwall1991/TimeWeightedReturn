using Domain.Entities;
using Domain.ValueObjects;

namespace Domain.Services;

/// <summary>
///     Enhanced Time Weighted Return service that properly handles cash flows
///     according to GIPS standards and portfolio management best practices
/// </summary>
public class EnhancedTimeWeightedReturnService
{
    /// <summary>
    ///     Calculate TWR with proper cash flow handling
    ///     External flows break the calculation into sub-periods
    /// </summary>
    public EnhancedTwrResult Calculate(
        IEnumerable<ValuationPoint> valuations,
        IEnumerable<CashFlow> cashFlows,
        DateRange period)
    {
        var result = new EnhancedTwrResult
        {
            Period = period,
            TotalReturn = 0m,
            SubPeriods = []
        };

        // Filter cash flows by category for TWR treatment
        var externalFlows = cashFlows
            .Where(cf => cf.Category == CashFlowCategory.ExternalFlow)
            .OrderBy(cf => cf.Date)
            .ToList();

        var performanceFlows = cashFlows
            .Where(cf => cf.Category == CashFlowCategory.PerformanceInfluencing)
            .OrderBy(cf => cf.Date)
            .ToList();

        // Create sub-periods broken by external cash flows
        var subPeriods = CreateSubPeriods(valuations, externalFlows, period);

        var chainedReturn = 1m;

        foreach (var subPeriod in subPeriods)
        {
            var subPeriodFlows = performanceFlows
                .Where(cf => cf.Date >= subPeriod.StartDate && cf.Date <= subPeriod.EndDate)
                .ToList();

            var subPeriodReturn = CalculateSubPeriodReturn(subPeriod, subPeriodFlows);

            result.SubPeriods.Add(subPeriodReturn);
            chainedReturn *= 1 + subPeriodReturn.Return;
        }

        result.TotalReturn = chainedReturn - 1;
        result.ExternalFlowCount = externalFlows.Count;
        result.PerformanceFlowCount = performanceFlows.Count;

        return result;
    }

    /// <summary>
    ///     Create sub-periods broken by external cash flows
    /// </summary>
    private List<SubPeriodBoundary> CreateSubPeriods(
        IEnumerable<ValuationPoint> valuations,
        List<CashFlow> externalFlows,
        DateRange period)
    {
        var subPeriods = new List<SubPeriodBoundary>();
        var orderedValuations = valuations.OrderBy(v => v.Date).ToList();

        var currentStart = period.Start;

        foreach (var flow in externalFlows)
            if (flow.Date > currentStart && flow.Date <= period.End)
            {
                // Create sub-period ending just before the external flow
                var endValuation = orderedValuations
                    .LastOrDefault(v => v.Date < flow.Date);

                if (endValuation != null)
                {
                    var startValuation = orderedValuations
                        .FirstOrDefault(v => v.Date >= currentStart);

                    if (startValuation != null)
                        subPeriods.Add(new SubPeriodBoundary
                        {
                            StartDate = currentStart,
                            EndDate = endValuation.Date,
                            StartValue = startValuation.Value,
                            EndValue = endValuation.Value,
                            ExternalFlowAmount = 0m // No external flow in this period
                        });
                }

                // Next sub-period starts after the external flow
                currentStart = flow.Date.AddDays(1);
            }

        // Final sub-period from last external flow to end
        var finalStartValuation = orderedValuations
            .FirstOrDefault(v => v.Date >= currentStart);
        var finalEndValuation = orderedValuations
            .LastOrDefault(v => v.Date <= period.End);

        if (finalStartValuation != null && finalEndValuation != null)
            subPeriods.Add(new SubPeriodBoundary
            {
                StartDate = currentStart,
                EndDate = period.End,
                StartValue = finalStartValuation.Value,
                EndValue = finalEndValuation.Value,
                ExternalFlowAmount = 0m
            });

        return subPeriods;
    }

    /// <summary>
    ///     Calculate return for a single sub-period including performance flows
    /// </summary>
    private EnhancedSubPeriod CalculateSubPeriodReturn(
        SubPeriodBoundary boundary,
        List<CashFlow> performanceFlows)
    {
        var totalPerformanceFlow = performanceFlows.Sum(f => f.Amount);

        // Modified TWR formula: (End Value - Start Value - Performance Flows) / Start Value
        var return_ = boundary.StartValue > 0
            ? (boundary.EndValue - boundary.StartValue - totalPerformanceFlow) / boundary.StartValue
            : 0m;

        return new EnhancedSubPeriod
        {
            StartDate = boundary.StartDate,
            EndDate = boundary.EndDate,
            StartValue = boundary.StartValue,
            EndValue = boundary.EndValue,
            Return = return_,
            PerformanceFlows = performanceFlows.Select(f => new CashFlowSummary
            {
                Date = f.Date,
                Amount = f.Amount,
                Type = f.Type,
                Description = f.Description
            }).ToList(),
            Days = (boundary.EndDate.ToDateTime(TimeOnly.MinValue) - boundary.StartDate.ToDateTime(TimeOnly.MinValue))
                .Days
        };
    }
}

/// <summary>
///     Enhanced TWR calculation result with detailed cash flow treatment
/// </summary>
public class EnhancedTwrResult
{
    public DateRange Period { get; set; } = new(DateOnly.MinValue, DateOnly.MinValue);
    public decimal TotalReturn { get; set; }
    public List<EnhancedSubPeriod> SubPeriods { get; set; } = [];
    public int ExternalFlowCount { get; set; }
    public int PerformanceFlowCount { get; set; }

    public decimal AnnualizedReturn => SubPeriods.Any()
        ? (decimal)Math.Pow((double)(1 + TotalReturn), 365.25 / TotalDays) - 1
        : 0m;

    public int TotalDays => SubPeriods.Sum(sp => sp.Days);
}

/// <summary>
///     Enhanced sub-period with cash flow details
/// </summary>
public class EnhancedSubPeriod
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal StartValue { get; set; }
    public decimal EndValue { get; set; }
    public decimal Return { get; set; }
    public List<CashFlowSummary> PerformanceFlows { get; set; } = [];
    public int Days { get; set; }

    public decimal TotalPerformanceFlow => PerformanceFlows.Sum(f => f.Amount);
}

/// <summary>
///     Supporting classes
/// </summary>
public class ValuationPoint
{
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
}

public class SubPeriodBoundary
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal StartValue { get; set; }
    public decimal EndValue { get; set; }
    public decimal ExternalFlowAmount { get; set; }
}

public class CashFlowSummary
{
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public CashFlowType Type { get; set; }
    public string Description { get; set; } = string.Empty;
}
