namespace Domain.Enums;

/// <summary>
///     Status of an item in the reconciliation workflow
/// </summary>
public enum ReconciliationStatus
{
    /// <summary>
    ///     Item is pending review and reconciliation
    /// </summary>
    Pending = 1,

    /// <summary>
    ///     Item has been automatically matched and validated
    /// </summary>
    Matched = 2,

    /// <summary>
    ///     Item has been approved and moved to ABoR
    /// </summary>
    Approved = 3,

    /// <summary>
    ///     Item was rejected during reconciliation
    /// </summary>
    Rejected = 4,

    /// <summary>
    ///     Item has a reconciliation break that needs resolution
    /// </summary>
    Break = 5
}
