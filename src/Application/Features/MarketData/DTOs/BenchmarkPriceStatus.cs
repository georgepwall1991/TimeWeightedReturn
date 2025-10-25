namespace Application.Features.MarketData.DTOs;

public record BenchmarkPriceStatus(
    Guid BenchmarkId,
    string IndexSymbol,
    string Name,
    DateTime? LastUpdate,
    bool NeedsUpdate);
