namespace Application.Features.Analytics.DTOs;

public record TwrResult
{
    public Guid AccountId { get; init; }
    public DateOnly StartDate { get; init; }
    public DateOnly EndDate { get; init; }
    public decimal TimeWeightedReturn { get; init; }
    public decimal AnnualizedReturn { get; init; }
    public int Days { get; init; }
    public int NumberOfSubPeriods { get; init; }
    public decimal StartValue { get; init; }
    public decimal EndValue { get; init; }
    public decimal TotalNetFlows { get; init; }
}
