namespace Domain.Entities;

public class Price
{
    public Guid Id { get; set; }
    public Guid InstrumentId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Value { get; set; }
    public PriceSource Source { get; set; } = PriceSource.Manual;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Instrument Instrument { get; set; } = null!;
}

public enum PriceSource
{
    Manual = 0,
    AlphaVantage = 1,
    Finnhub = 2,
    YahooFinance = 3
}
