namespace Domain.Entities;

public class Client
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty; // Represents the advisor who owns this client
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
}
