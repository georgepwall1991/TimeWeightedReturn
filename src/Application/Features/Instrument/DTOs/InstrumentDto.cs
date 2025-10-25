using Domain.Enums;

namespace Application.Features.Instrument.DTOs;

public record InstrumentDto(
    Guid Id,
    string Ticker,
    string Name,
    string Currency,
    InstrumentType Type,
    string? Isin,
    string? Sedol,
    string? Cusip,
    AssetClass? AssetClass,
    string? Sector,
    string? Exchange,
    string? Country,
    PriceSource? PreferredDataProvider,
    string? DataProviderConfig,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateInstrumentRequest(
    string Ticker,
    string Name,
    string Currency,
    InstrumentType Type,
    string? Isin = null,
    string? Sedol = null,
    string? Cusip = null,
    AssetClass? AssetClass = null,
    string? Sector = null,
    string? Exchange = null,
    string? Country = null,
    PriceSource? PreferredDataProvider = null,
    string? DataProviderConfig = null);

public record UpdateInstrumentRequest(
    string Ticker,
    string Name,
    string Currency,
    InstrumentType Type,
    string? Isin = null,
    string? Sedol = null,
    string? Cusip = null,
    AssetClass? AssetClass = null,
    string? Sector = null,
    string? Exchange = null,
    string? Country = null,
    PriceSource? PreferredDataProvider = null,
    string? DataProviderConfig = null);
