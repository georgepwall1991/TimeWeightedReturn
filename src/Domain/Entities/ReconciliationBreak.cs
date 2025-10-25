using Domain.Enums;

namespace Domain.Entities;

/// <summary>
///     Represents a reconciliation exception/break that requires investigation
/// </summary>
public class ReconciliationBreak
{
    public Guid Id { get; set; }

    /// <summary>
    ///     Reference to the reconciliation batch this break belongs to
    /// </summary>
    public Guid BatchId { get; set; }

    /// <summary>
    ///     Type of break
    /// </summary>
    public ReconciliationBreakType BreakType { get; set; }

    /// <summary>
    ///     Entity type this break relates to (e.g., "CashFlow", "Holding", "Price")
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    ///     ID of the IBoR entity (if applicable)
    /// </summary>
    public Guid? IBorEntityId { get; set; }

    /// <summary>
    ///     ID of the ABoR entity (if applicable)
    /// </summary>
    public Guid? ABorEntityId { get; set; }

    /// <summary>
    ///     Account this break relates to
    /// </summary>
    public Guid? AccountId { get; set; }

    /// <summary>
    ///     Instrument this break relates to (if applicable)
    /// </summary>
    public Guid? InstrumentId { get; set; }

    /// <summary>
    ///     Date the break relates to
    /// </summary>
    public DateOnly? BreakDate { get; set; }

    /// <summary>
    ///     Description of the break
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    ///     Expected value (from IBoR or rule)
    /// </summary>
    public string? ExpectedValue { get; set; }

    /// <summary>
    ///     Actual value (from ABoR or source)
    /// </summary>
    public string? ActualValue { get; set; }

    /// <summary>
    ///     Difference/variance (for numeric breaks)
    /// </summary>
    public decimal? Variance { get; set; }

    /// <summary>
    ///     Status of the break
    /// </summary>
    public ReconciliationStatus Status { get; set; } = ReconciliationStatus.Break;

    /// <summary>
    ///     User who resolved this break
    /// </summary>
    public string? ResolvedBy { get; set; }

    /// <summary>
    ///     When the break was resolved
    /// </summary>
    public DateTime? ResolvedAt { get; set; }

    /// <summary>
    ///     How the break was resolved (e.g., "Accept IBoR", "Override", "Data Correction")
    /// </summary>
    public string? ResolutionAction { get; set; }

    /// <summary>
    ///     Comments about the break and its resolution
    /// </summary>
    public string? Comments { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ReconciliationBatch Batch { get; set; } = null!;
    public virtual Account? Account { get; set; }
    public virtual Instrument? Instrument { get; set; }
}
