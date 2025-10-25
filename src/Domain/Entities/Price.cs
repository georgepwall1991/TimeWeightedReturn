using Domain.Enums;

namespace Domain.Entities;

public class Price
{
    public Guid Id { get; set; }
    public Guid InstrumentId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
    public PriceSource Source { get; set; } = PriceSource.Manual;

    // ABoR/IBoR Workflow fields
    public BookOfRecord BookOfRecord { get; set; } = BookOfRecord.ABoR; // Default to ABoR for existing data
    public ReconciliationStatus Status { get; set; } = ReconciliationStatus.Approved; // Default to approved for existing data
    public Guid? BatchId { get; set; } // Link to reconciliation batch if imported
    public string? SubmittedBy { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Instrument Instrument { get; set; } = null!;
    public virtual ReconciliationBatch? Batch { get; set; }
}
