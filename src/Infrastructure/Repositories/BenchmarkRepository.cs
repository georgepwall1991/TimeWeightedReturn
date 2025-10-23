using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BenchmarkRepository : IBenchmarkRepository
{
    private readonly PortfolioContext _context;

    public BenchmarkRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Benchmark>> GetAllBenchmarksAsync()
    {
        return await _context.Benchmarks
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync();
    }

    public async Task<Benchmark?> GetBenchmarkByIdAsync(Guid id)
    {
        return await _context.Benchmarks
            .Include(b => b.Prices)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Benchmark?> GetBenchmarkBySymbolAsync(string symbol)
    {
        return await _context.Benchmarks
            .Include(b => b.Prices)
            .FirstOrDefaultAsync(b => b.IndexSymbol == symbol);
    }

    public async Task<Benchmark> CreateBenchmarkAsync(Benchmark benchmark)
    {
        benchmark.CreatedAt = DateTime.UtcNow;
        benchmark.UpdatedAt = DateTime.UtcNow;

        _context.Benchmarks.Add(benchmark);
        await _context.SaveChangesAsync();

        return benchmark;
    }

    public async Task<Benchmark> UpdateBenchmarkAsync(Benchmark benchmark)
    {
        benchmark.UpdatedAt = DateTime.UtcNow;

        _context.Benchmarks.Update(benchmark);
        await _context.SaveChangesAsync();

        return benchmark;
    }

    public async Task DeleteBenchmarkAsync(Guid id)
    {
        var benchmark = await _context.Benchmarks.FindAsync(id);
        if (benchmark != null)
        {
            _context.Benchmarks.Remove(benchmark);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<BenchmarkPrice>> GetBenchmarkPricesAsync(Guid benchmarkId, DateOnly startDate, DateOnly endDate)
    {
        return await _context.BenchmarkPrices
            .Where(p => p.BenchmarkId == benchmarkId && p.Date >= startDate && p.Date <= endDate)
            .OrderBy(p => p.Date)
            .ToListAsync();
    }

    public async Task AddBenchmarkPricesAsync(IEnumerable<BenchmarkPrice> prices)
    {
        var now = DateTime.UtcNow;
        foreach (var price in prices)
        {
            price.CreatedAt = now;
            price.UpdatedAt = now;
        }

        _context.BenchmarkPrices.AddRange(prices);
        await _context.SaveChangesAsync();
    }

    public async Task<decimal> CalculateBenchmarkReturnAsync(Guid benchmarkId, DateOnly startDate, DateOnly endDate)
    {
        var prices = await GetBenchmarkPricesAsync(benchmarkId, startDate, endDate);

        var priceList = prices.ToList();
        if (priceList.Count < 2)
            throw new InvalidOperationException("Insufficient price data to calculate return");

        var startPrice = priceList.First().Value;
        var endPrice = priceList.Last().Value;

        return (endPrice - startPrice) / startPrice;
    }
}
