namespace Domain.Entities
{
    public class Benchmark
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<BenchmarkHolding> Holdings { get; set; } = new List<BenchmarkHolding>();
    }

    public class BenchmarkHolding
    {
        public Guid Id { get; set; }
        public Guid BenchmarkId { get; set; }
        public Guid InstrumentId { get; set; }
        public decimal Weight { get; set; }
        public Instrument Instrument { get; set; } = null!;
    }
}
