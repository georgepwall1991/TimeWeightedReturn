namespace Application.Features.Portfolio.DTOs;

public record PortfolioTreeResponse(
    IReadOnlyList<ClientNodeDto> Clients,
    decimal TotalValueGBP,
    DateTime LastUpdated
);

public abstract record PortfolioTreeNodeDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string NodeType { get; init; } = string.Empty;
    public decimal TotalValueGBP { get; init; }
    public int HoldingsCount { get; init; }
    public PerformanceMetricsDto? Metrics { get; init; }
}

public record ClientNodeDto : PortfolioTreeNodeDto
{
    public IReadOnlyList<PortfolioNodeDto> Portfolios { get; init; } = Array.Empty<PortfolioNodeDto>();
    public int PortfoliosCount => Portfolios.Count;

    public ClientNodeDto()
    {
        NodeType = "Client";
    }
}

public record PortfolioNodeDto : PortfolioTreeNodeDto
{
    public Guid ClientId { get; init; }
    public IReadOnlyList<AccountNodeDto> Accounts { get; init; } = Array.Empty<AccountNodeDto>();
    public int AccountsCount => Accounts.Count;

    public PortfolioNodeDto()
    {
        NodeType = "Portfolio";
    }
}

public record AccountNodeDto : PortfolioTreeNodeDto
{
    public Guid PortfolioId { get; init; }
    public string AccountNumber { get; init; } = string.Empty;
    public string Currency { get; init; } = "GBP";

    public AccountNodeDto()
    {
        NodeType = "Account";
    }
}

public record PerformanceMetricsDto
{
    public decimal? TimeWeightedReturn { get; init; }
    public decimal? AnnualizedReturn { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public int? Days { get; init; }
}
