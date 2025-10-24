using Application.Features.MarketData.DTOs;

namespace Application.Interfaces;

public interface IPriceUpdateService
{
    Task<MarketDataStatus> RefreshAllPricesAsync(
        DateOnly? date = null,
        CancellationToken cancellationToken = default);

    Task<bool> RefreshInstrumentPriceAsync(
        Guid instrumentId,
        DateOnly? date = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<InstrumentPriceStatus>> GetInstrumentPriceStatusAsync(
        CancellationToken cancellationToken = default);
}
