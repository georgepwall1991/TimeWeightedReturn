using Domain.Entities;

namespace Application.Services;

public interface ICurrencyConversionService
{
    decimal ConvertToGbp(decimal amount, string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates);
    decimal? GetFxRate(string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates);
}

public class CurrencyConversionService : ICurrencyConversionService
{
    public decimal ConvertToGbp(decimal amount, string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates)
    {
        if (fromCurrency == "GBP")
            return amount;

        var fxRate = GetFxRate(fromCurrency, date, fxRates);
        if (!fxRate.HasValue)
            throw new InvalidOperationException(
                $"No FX rate found for {fromCurrency} to GBP on {date}. " +
                "Please ensure FX rates are loaded for all required currencies and dates.");

        return amount / fxRate.Value; // Convert from quote currency to base (GBP)
    }

    public decimal? GetFxRate(string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates)
    {
        if (fromCurrency == "GBP")
            return 1.0m;

        var fxRate = fxRates.FirstOrDefault(fx =>
            fx.BaseCurrency == "GBP" &&
            fx.QuoteCurrency == fromCurrency &&
            fx.Date == date);

        return fxRate?.Rate;
    }
}
