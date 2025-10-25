namespace Application.Features.FxRates.DTOs;

public record CurrencyPairStatus(
    string BaseCurrency,
    string QuoteCurrency,
    DateTime? LastUpdate,
    bool NeedsUpdate);
