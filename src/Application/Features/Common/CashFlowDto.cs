using Domain.Entities;

namespace Application.Features.Common;

public class CashFlowDto
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public CashFlowType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public CashFlowCategory Category { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? TransactionReference { get; set; }
    public bool IsPerformanceInfluencing => Category == CashFlowCategory.PerformanceInfluencing;
    public bool IsExternalFlow => Category == CashFlowCategory.ExternalFlow;
}

public class CashFlowSummaryDto
{
    public DateOnly Date { get; set; }
    public decimal TotalInflows { get; set; }
    public decimal TotalOutflows { get; set; }
    public decimal NetFlow => TotalInflows + TotalOutflows; // Outflows are negative
    public int TransactionCount { get; set; }
    public List<CashFlowDto> Transactions { get; set; } = [];
}

public class CashFlowAnalysisDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }

    // Performance-Influencing Flows
    public decimal TotalPerformanceInflows { get; set; }
    public decimal TotalPerformanceOutflows { get; set; }
    public decimal NetPerformanceFlow => TotalPerformanceInflows + TotalPerformanceOutflows;
    public List<CashFlowDto> PerformanceFlows { get; set; } = [];

    // External Flows (TWR sub-period breakers)
    public decimal TotalExternalInflows { get; set; }
    public decimal TotalExternalOutflows { get; set; }
    public decimal NetExternalFlow => TotalExternalInflows + TotalExternalOutflows;
    public List<CashFlowDto> ExternalFlows { get; set; } = [];
    public int SubPeriodBreaks => ExternalFlows.Count;

    // Internal Flows (no TWR impact)
    public decimal TotalInternalFlow { get; set; }
    public List<CashFlowDto> InternalFlows { get; set; } = [];

    // Summary
    public decimal GrandTotalInflows => TotalPerformanceInflows + TotalExternalInflows;
    public decimal GrandTotalOutflows => TotalPerformanceOutflows + TotalExternalOutflows;
    public decimal GrandNetFlow => GrandTotalInflows + GrandTotalOutflows;
}

public class CreateCashFlowDto
{
    public Guid AccountId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public CashFlowType Type { get; set; }
    public string? TransactionReference { get; set; }
}

public class EnhancedTwrResultDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public decimal TotalReturn { get; set; }
    public decimal AnnualizedReturn { get; set; }
    public int SubPeriodCount { get; set; }
    public int ExternalFlowCount { get; set; }
    public int PerformanceFlowCount { get; set; }
    public List<EnhancedSubPeriodDto> SubPeriods { get; set; } = [];
    public CashFlowAnalysisDto CashFlowAnalysis { get; set; } = new();
}

public class EnhancedSubPeriodDto
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int Days { get; set; }
    public decimal StartValue { get; set; }
    public decimal EndValue { get; set; }
    public decimal Return { get; set; }
    public decimal TotalPerformanceFlow { get; set; }
    public int PerformanceFlowCount { get; set; }
    public List<CashFlowSummaryItemDto> PerformanceFlows { get; set; } = [];
}

public class CashFlowSummaryItemDto
{
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; }
    public CashFlowType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
