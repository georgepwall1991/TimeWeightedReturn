namespace Application.Features.DataHealth.DTOs;

public enum HealthSeverity
{
    OK,
    Warning,
    Critical
}

public record DataHealthSummary(
    HealthSeverity OverallHealth,
    int TotalIssues,
    int CriticalIssues,
    int WarningIssues,
    DateTime LastChecked,
    DataTypeHealth Prices,
    DataTypeHealth FxRates,
    DataTypeHealth Benchmarks,
    DataTypeHealth Holdings);

public record DataTypeHealth(
    string DataType,
    HealthSeverity Severity,
    int TotalItems,
    int StaleItems,
    int HealthyItems,
    DateTime? OldestUpdate);

public record DataHealthDetail(
    string EntityType,
    string EntityId,
    string EntityName,
    HealthSeverity Severity,
    string Issue,
    DateTime? LastUpdate,
    int DaysSinceUpdate,
    string? Recommendation);
