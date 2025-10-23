namespace Domain.Exceptions;

/// <summary>
/// Thrown when a date range is invalid (e.g., start date after end date)
/// </summary>
public class InvalidDateRangeException : DomainException
{
    public DateOnly? StartDate { get; }
    public DateOnly? EndDate { get; }

    public InvalidDateRangeException(DateOnly startDate, DateOnly endDate)
        : base($"Invalid date range: start date {startDate} must be before or equal to end date {endDate}")
    {
        StartDate = startDate;
        EndDate = endDate;
    }

    public InvalidDateRangeException(string message) : base(message)
    {
    }
}
