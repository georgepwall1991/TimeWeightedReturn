namespace Domain.Entities;

public class Instrument
{
    public Guid Id { get; set; }
    public string Ticker { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public InstrumentType Type { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Holding> Holdings { get; set; } = new List<Holding>();
    public virtual ICollection<Price> Prices { get; set; } = new List<Price>();
}

public enum InstrumentType
{
    Cash = 0,
    Security = 1
}
