namespace Domain.Entities;

public class Account
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string Currency { get; set; } = "GBP"; // Base currency
    public Guid PortfolioId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Portfolio Portfolio { get; set; } = null!;
    public virtual ICollection<Holding> Holdings { get; set; } = new List<Holding>();
    public virtual ICollection<CashFlow> CashFlows { get; set; } = new List<CashFlow>();
}
