namespace Domain.Entities;

/// <summary>
///     Comprehensive audit trail for all changes in the system
/// </summary>
public class AuditLog
{
    public Guid Id { get; set; }

    /// <summary>
    ///     Type of entity being audited (e.g., "CashFlow", "Holding", "ReconciliationBatch")
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    ///     ID of the entity being audited
    /// </summary>
    public Guid EntityId { get; set; }

    /// <summary>
    ///     Action performed (e.g., "Create", "Update", "Delete", "Approve", "Reject")
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    ///     User who performed the action
    /// </summary>
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>
    ///     When the action was performed
    /// </summary>
    public DateTime PerformedAt { get; set; }

    /// <summary>
    ///     Previous values (serialized as JSON)
    /// </summary>
    public string? OldValues { get; set; }

    /// <summary>
    ///     New values (serialized as JSON)
    /// </summary>
    public string? NewValues { get; set; }

    /// <summary>
    ///     Changes made (serialized as JSON - only changed fields)
    /// </summary>
    public string? Changes { get; set; }

    /// <summary>
    ///     User comments or reason for change
    /// </summary>
    public string? Comments { get; set; }

    /// <summary>
    ///     IP address of the user (optional)
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    ///     Additional metadata (serialized as JSON)
    /// </summary>
    public string? Metadata { get; set; }
}
