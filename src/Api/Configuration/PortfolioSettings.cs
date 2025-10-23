namespace Api.Configuration;

public class PortfolioSettings
{
    public const string SectionName = "Portfolio";

    public string BaseCurrency { get; set; } = "GBP";
    public int DefaultDateRangeDays { get; set; } = 730; // 2 years
    public int MaxDateRangeDays { get; set; } = 3650; // 10 years
}
