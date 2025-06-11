namespace Application.Features.Common.DTOs;

public class HoldingDto
{
    public Guid HoldingId { get; set; }
    public string Ticker { get; set; } = string.Empty;
    public string InstrumentName { get; set; } = string.Empty;
    public string InstrumentType { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public decimal Units { get; set; }
    public decimal Price { get; set; }
    public decimal LocalValue { get; set; } // Units × Price in original currency
    public decimal FxRate { get; set; } // Exchange rate to GBP (1.0 if already GBP)
    public decimal ValueGBP { get; set; } // Value converted to GBP
    public DateOnly Date { get; set; }
}
