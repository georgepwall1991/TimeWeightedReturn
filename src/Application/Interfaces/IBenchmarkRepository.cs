using Domain.Entities;

namespace Application.Interfaces;

public interface IBenchmarkRepository
{
    Task<IEnumerable<Benchmark>> GetAllBenchmarksAsync();
    Task<Benchmark?> GetBenchmarkByIdAsync(Guid id);
    Task<Benchmark?> GetBenchmarkBySymbolAsync(string symbol);
    Task<Benchmark> CreateBenchmarkAsync(Benchmark benchmark);
    Task<Benchmark> UpdateBenchmarkAsync(Benchmark benchmark);
    Task DeleteBenchmarkAsync(Guid id);

    Task<IEnumerable<BenchmarkPrice>> GetBenchmarkPricesAsync(Guid benchmarkId, DateOnly startDate, DateOnly endDate);
    Task AddBenchmarkPricesAsync(IEnumerable<BenchmarkPrice> prices);

    Task<decimal> CalculateBenchmarkReturnAsync(Guid benchmarkId, DateOnly startDate, DateOnly endDate);
}
