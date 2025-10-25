using Application.Features.FxRates.DTOs;

namespace Application.Interfaces;

public interface IFxRateUpdateService
{
    Task<FxRateUpdateStatus> RefreshAllFxRatesAsync(
        DateOnly? date = null,
        CancellationToken cancellationToken = default);

    Task<bool> RefreshFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly? date = null,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<CurrencyPairStatus>> GetFxRateStatusAsync(
        CancellationToken cancellationToken = default);
}
