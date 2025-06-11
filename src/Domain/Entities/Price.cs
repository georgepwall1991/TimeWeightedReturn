namespace Domain.Entities;

public class Price
{
    public Guid Id { get; set; }
    public Guid InstrumentId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Instrument Instrument { get; set; } = null!;
}
