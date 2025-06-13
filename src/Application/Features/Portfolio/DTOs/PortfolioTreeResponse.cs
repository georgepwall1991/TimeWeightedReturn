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
    public ClientNodeDto()
    {
        NodeType = "Client";
    }

    public IReadOnlyList<PortfolioNodeDto> Portfolios { get; init; } = [];
    public int PortfoliosCount => Portfolios.Count;
}

public record PortfolioNodeDto : PortfolioTreeNodeDto
{
    public PortfolioNodeDto()
    {
        NodeType = "Portfolio";
    }

    public Guid ClientId { get; init; }
    public IReadOnlyList<AccountNodeDto> Accounts { get; init; } = [];
    public int AccountsCount => Accounts.Count;
}

public record AccountNodeDto : PortfolioTreeNodeDto
{
    public AccountNodeDto()
    {
        NodeType = "Account";
    }

    public Guid PortfolioId { get; init; }
    public string AccountNumber { get; init; } = string.Empty;
    public string Currency { get; init; } = "GBP";
}

public record PerformanceMetricsDto
{
    public decimal? TimeWeightedReturn { get; init; }
    public decimal? AnnualizedReturn { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public int? Days { get; init; }
}
