namespace Application.Interfaces;

public interface IFxRateProvider
{
    string ProviderName { get; }

    Task<decimal?> GetFxRateAsync(
        string baseCurrency,
        string quoteCurrency,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<Dictionary<string, decimal>> GetMultipleFxRatesAsync(
        string baseCurrency,
        IEnumerable<string> quoteCurrencies,
        DateOnly date,
        CancellationToken cancellationToken = default);

    Task<bool> IsAvailableAsync(CancellationToken cancellationToken = default);
}
