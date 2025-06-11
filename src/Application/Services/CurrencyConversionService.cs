using Domain.Entities;

namespace Application.Services;

public interface ICurrencyConversionService
{
    decimal ConvertToGBP(decimal amount, string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates);
    decimal GetFxRate(string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates);
}

public class CurrencyConversionService : ICurrencyConversionService
{
    public decimal ConvertToGBP(decimal amount, string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates)
    {
        if (fromCurrency == "GBP")
            return amount;

        var fxRate = GetFxRate(fromCurrency, date, fxRates);
        return amount / fxRate; // Convert from quote currency to base (GBP)
    }

    public decimal GetFxRate(string fromCurrency, DateOnly date, IEnumerable<FxRate> fxRates)
    {
        if (fromCurrency == "GBP")
            return 1.0m;

        var fxRate = fxRates.FirstOrDefault(fx =>
            fx.BaseCurrency == "GBP" &&
            fx.QuoteCurrency == fromCurrency &&
            fx.Date == date);

        if (fxRate == null)
        {
            throw new InvalidOperationException(
                $"No FX rate found for {fromCurrency} to GBP on {date}. " +
                "Please ensure FX rates are loaded for all required currencies and dates.");
        }

        return fxRate.Rate;
    }
}
