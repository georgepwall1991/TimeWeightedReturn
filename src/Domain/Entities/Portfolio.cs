namespace Domain.Entities;

public class Portfolio
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid ClientId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Client Client { get; set; } = null!;
    public virtual ICollection<Account> Accounts { get; set; } = new List<Account>();
}
