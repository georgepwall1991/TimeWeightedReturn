namespace Domain.Entities;

public class FxRate
{
    public Guid Id { get; set; }
    public string BaseCurrency { get; set; } = "GBP"; // Always GBP as base
    public string QuoteCurrency { get; set; } = string.Empty; // USD, EUR, etc.
    public DateOnly Date { get; set; }
    public decimal Rate { get; set; } // How many quote currency per 1 base currency
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
