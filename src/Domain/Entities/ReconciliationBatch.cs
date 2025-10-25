using Domain.Enums;

namespace Domain.Entities;

/// <summary>
///     Represents a batch of data imported for reconciliation (e.g., daily custodian file)
/// </summary>
public class ReconciliationBatch
{
    public Guid Id { get; set; }

    /// <summary>
    ///     Date this batch represents (e.g., valuation date, statement date)
    /// </summary>
    public DateOnly BatchDate { get; set; }

    /// <summary>
    ///     Source of the batch data (e.g., "Custodian CSV", "Manual Entry", "API Import")
    /// </summary>
    public string Source { get; set; } = string.Empty;

    /// <summary>
    ///     Optional reference to the source file
    /// </summary>
    public string? SourceFileName { get; set; }

    /// <summary>
    ///     Status of the batch reconciliation
    /// </summary>
    public ReconciliationStatus Status { get; set; } = ReconciliationStatus.Pending;

    /// <summary>
    ///     Number of items in this batch
    /// </summary>
    public int ItemCount { get; set; }

    /// <summary>
    ///     Number of items that matched automatically
    /// </summary>
    public int MatchedCount { get; set; }

    /// <summary>
    ///     Number of items with breaks
    /// </summary>
    public int BreakCount { get; set; }

    /// <summary>
    ///     User who submitted/imported this batch
    /// </summary>
    public string? SubmittedBy { get; set; }

    /// <summary>
    ///     User who approved this batch
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    ///     When the batch was approved
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    ///     Comments or notes about this batch
    /// </summary>
    public string? Comments { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<ReconciliationBreak> Breaks { get; set; } = new List<ReconciliationBreak>();
}
