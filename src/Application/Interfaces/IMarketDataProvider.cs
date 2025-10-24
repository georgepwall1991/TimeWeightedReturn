using Application.Features.MarketData.DTOs;
using Domain.Entities;

namespace Application.Interfaces;

public interface IMarketDataProvider
{
    PriceSource ProviderType { get; }

    Task<MarketDataPrice?> GetPriceAsync(string ticker, DateOnly date, CancellationToken cancellationToken = default);

    Task<IEnumerable<MarketDataPrice>> GetPricesAsync(
        string ticker,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default);

    Task<bool> ValidateTickerAsync(string ticker, CancellationToken cancellationToken = default);

    Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default);
}
