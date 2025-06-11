namespace Domain.ValueObjects;

public record SubPeriod
{
    public decimal StartValue { get; init; }
    public decimal EndValue { get; init; }
    public decimal NetFlow { get; init; }

    public SubPeriod(decimal startValue, decimal endValue, decimal netFlow)
    {
        if (startValue <= 0)
            throw new ArgumentException("Start value must be positive", nameof(startValue));

        StartValue = startValue;
        EndValue = endValue;
        NetFlow = netFlow;
    }

    /// <summary>
    /// Calculate the return for this sub-period using TWR formula:
    /// R = (End Value - Start Value - Net Flow) / Start Value
    /// </summary>
    public decimal Return => (EndValue - StartValue - NetFlow) / StartValue;
}