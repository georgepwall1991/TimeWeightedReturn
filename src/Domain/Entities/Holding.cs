namespace Domain.Entities;

public class Holding
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public Guid InstrumentId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Units { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Account Account { get; set; } = null!;
    public virtual Instrument Instrument { get; set; } = null!;
}
