namespace Domain.ValueObjects;

public record DateRange
{
    public DateOnly Start { get; init; }
    public DateOnly End { get; init; }

    public DateRange(DateOnly start, DateOnly end)
    {
        if (end < start)
            throw new ArgumentException("End date must be after start date", nameof(end));

        Start = start;
        End = end;
    }

    public int Days => End.DayNumber - Start.DayNumber + 1;

    public bool Contains(DateOnly date) => date >= Start && date <= End;

    public IEnumerable<DateOnly> GetDates()
    {
        var current = Start;
        while (current <= End)
        {
            yield return current;
            current = current.AddDays(1);
        }
    }
}