using Domain.Entities;
using Domain.Enums;

namespace Domain.Models;

/// <summary>
///     Result of a reconciliation operation
/// </summary>
public class ReconciliationResult
{
    public Guid BatchId { get; set; }
    public DateOnly ReconciliationDate { get; set; }
    public int TotalItems { get; set; }
    public int MatchedItems { get; set; }
    public int UnmatchedItems { get; set; }
    public int BreakCount { get; set; }
    public bool IsFullyReconciled => BreakCount == 0 && UnmatchedItems == 0;
    public List<ReconciliationBreakInfo> Breaks { get; set; } = new();
    public List<MatchedItemInfo> MatchedTransactions { get; set; } = new();
    public List<UnmatchedItemInfo> UnmatchedIBorItems { get; set; } = new();
    public List<UnmatchedItemInfo> UnmatchedABorItems { get; set; } = new();
}

/// <summary>
///     Information about a reconciliation break
/// </summary>
public class ReconciliationBreakInfo
{
    public Guid BreakId { get; set; }
    public ReconciliationBreakType BreakType { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ExpectedValue { get; set; }
    public string? ActualValue { get; set; }
    public decimal? Variance { get; set; }
    public Guid? AccountId { get; set; }
    public Guid? InstrumentId { get; set; }
    public DateOnly? BreakDate { get; set; }
}

/// <summary>
///     Information about a matched item
/// </summary>
public class MatchedItemInfo
{
    public Guid IBorEntityId { get; set; }
    public Guid ABorEntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal? Amount { get; set; }
    public string? InstrumentTicker { get; set; }
    public bool IsExactMatch { get; set; }
    public decimal? Difference { get; set; }
}

/// <summary>
///     Information about an unmatched item
/// </summary>
public class UnmatchedItemInfo
{
    public Guid EntityId { get; set; }
    public BookOfRecord Source { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public decimal? Amount { get; set; }
    public decimal? Units { get; set; }
    public string? InstrumentTicker { get; set; }
    public string? Description { get; set; }
}
