namespace Domain.Exceptions;

/// <summary>
/// Thrown when currency conversion cannot be performed due to missing FX rates
/// </summary>
public class CurrencyConversionException : DomainException
{
    public string FromCurrency { get; }
    public string ToCurrency { get; }
    public DateOnly? RequestedDate { get; }

    public CurrencyConversionException(string fromCurrency, string toCurrency, DateOnly requestedDate)
        : base($"FX rate not available for {fromCurrency}/{toCurrency} on or before {requestedDate}")
    {
        FromCurrency = fromCurrency;
        ToCurrency = toCurrency;
        RequestedDate = requestedDate;
    }

    public CurrencyConversionException(string message) : base(message)
    {
        FromCurrency = string.Empty;
        ToCurrency = string.Empty;
    }
}
