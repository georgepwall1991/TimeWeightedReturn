namespace Domain.Entities;

public class UserPreferences
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Theme { get; set; } = "system"; // "light", "dark", or "system"
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
