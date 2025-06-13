namespace Application.Interfaces;

public interface IPortfolioRepository
{
    // ... existing methods ...

    Task<List<DateOnly>> GetHoldingDatesInRangeAsync(Guid accountId, DateOnly startDate, DateOnly endDate);
    Task<List<HoldingDto>> GetAccountHoldingsWithInstrumentDetailsAsync(Guid accountId, DateOnly date);
    Task<Dictionary<Guid, decimal>> GetPricesForHoldingsAsync(IEnumerable<Guid> holdingIds);

    Task<Dictionary<(string Base, string Quote), decimal>> GetFxRatesForHoldingsAsync(
        IEnumerable<(string Base, string Quote)> currencyPairs);
}

public class HoldingDto
{
    public Guid HoldingId { get; set; }
    public string Ticker { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Units { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "";
    public decimal ValueGBP { get; set; }
    public string InstrumentType { get; set; } = "";
}
