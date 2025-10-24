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

        // First try to get the exact date
        var fxRate = fxRates.FirstOrDefault(fx =>
            fx.BaseCurrency == "GBP" &&
            fx.QuoteCurrency == fromCurrency &&
            fx.Date == date);

        if (fxRate != null)
            return fxRate.Rate;

        // If not found (e.g., weekend or holiday), use the most recent rate before the requested date
        fxRate = fxRates
            .Where(fx => fx.BaseCurrency == "GBP" &&
                        fx.QuoteCurrency == fromCurrency &&
                        fx.Date < date)
            .OrderByDescending(fx => fx.Date)
            .FirstOrDefault();

        return fxRate?.Rate;
    }
}
