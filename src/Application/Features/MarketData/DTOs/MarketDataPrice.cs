using Domain.Entities;
using Domain.Enums;

namespace Application.Features.MarketData.DTOs;

public record MarketDataPrice(
    string Ticker,
    DateOnly Date,
    decimal Price,
    decimal? Volume = null,
    PriceSource Source = PriceSource.Manual);

public record MarketDataStatus(
    PriceSource Provider,
    bool IsAvailable,
    DateTime LastUpdateTime,
    int TotalInstruments,
    int UpdatedInstruments,
    int FailedInstruments,
    Dictionary<string, string> Errors);

public record InstrumentPriceStatus(
    Guid InstrumentId,
    string Ticker,
    string Name,
    DateTime? LastPriceDate,
    PriceSource? LastPriceSource,
    bool NeedsUpdate);
