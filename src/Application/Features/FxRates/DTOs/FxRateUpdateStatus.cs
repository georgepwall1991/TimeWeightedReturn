namespace Application.Features.FxRates.DTOs;

public record FxRateUpdateStatus(
    string Provider,
    bool Success,
    DateTime Timestamp,
    int TotalPairs,
    int UpdatedPairs,
    int FailedPairs,
    Dictionary<string, string> Errors);
