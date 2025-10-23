namespace Domain.Exceptions;

/// <summary>
/// Thrown when insufficient holdings data is available for calculations
/// </summary>
public class InsufficientHoldingsDataException : DomainException
{
    public Guid AccountId { get; }
    public DateOnly? RequestedDate { get; }

    public InsufficientHoldingsDataException(Guid accountId, DateOnly? requestedDate = null)
        : base($"Insufficient holdings data for account {accountId}" +
               (requestedDate.HasValue ? $" on {requestedDate.Value}" : ""))
    {
        AccountId = accountId;
        RequestedDate = requestedDate;
    }

    public InsufficientHoldingsDataException(string message) : base(message)
    {
    }
}
