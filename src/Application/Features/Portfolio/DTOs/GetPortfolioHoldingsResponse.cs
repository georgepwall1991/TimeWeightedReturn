namespace Application.Features.Portfolio.DTOs;

public record GetPortfolioHoldingsResponse(IReadOnlyList<HoldingDto> Holdings, decimal TotalValueGBP);

public record HoldingDto
{
    public Guid HoldingId { get; init; }
    public string Ticker { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string InstrumentType { get; init; } = string.Empty;
    public string Currency { get; init; } = string.Empty;
    public decimal Units { get; init; }
    public decimal Price { get; init; }
    public decimal LocalValue { get; init; } // Units × Price in original currency
    public decimal FxRate { get; init; } // Exchange rate to GBP (1.0 if already GBP)
    public decimal ValueGBP { get; init; } // Value converted to GBP
    public DateOnly Date { get; init; }
}
