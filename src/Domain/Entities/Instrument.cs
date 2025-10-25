using Domain.Enums;

namespace Domain.Entities;

public class Instrument
{
    public Guid Id { get; set; }
    public string Ticker { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public InstrumentType Type { get; set; }

    // Identifiers for data provider lookups
    public string? Isin { get; set; }
    public string? Sedol { get; set; }
    public string? Cusip { get; set; }

    // Classification and metadata
    public AssetClass? AssetClass { get; set; }
    public string? Sector { get; set; }
    public string? Exchange { get; set; }
    public string? Country { get; set; }

    // Data provider configuration
    public PriceSource? PreferredDataProvider { get; set; }
    public string? DataProviderConfig { get; set; } // JSON string for provider-specific settings

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Holding> Holdings { get; set; } = new List<Holding>();
    public virtual ICollection<Price> Prices { get; set; } = new List<Price>();
}
