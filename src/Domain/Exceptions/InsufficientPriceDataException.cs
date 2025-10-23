namespace Domain.Exceptions;

/// <summary>
/// Thrown when required price data is not available for calculations
/// </summary>
public class InsufficientPriceDataException : DomainException
{
    public Guid InstrumentId { get; }
    public DateOnly RequestedDate { get; }

    public InsufficientPriceDataException(Guid instrumentId, DateOnly requestedDate)
        : base($"Price data not available for instrument {instrumentId} on or before {requestedDate}")
    {
        InstrumentId = instrumentId;
        RequestedDate = requestedDate;
    }

    public InsufficientPriceDataException(string message) : base(message)
    {
    }
}
