using Application.Features.Benchmark.DTOs;
using Application.Features.Common.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Queries;

public record CompareToBenchmarkQuery(
    Guid AccountId,
    Guid BenchmarkId,
    DateOnly StartDate,
    DateOnly EndDate
) : IRequest<BenchmarkComparisonDto>;

public class CompareToBenchmarkQueryHandler : IRequestHandler<CompareToBenchmarkQuery, BenchmarkComparisonDto>
{
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly Interfaces.IBenchmarkRepository _benchmarkRepository;

    public CompareToBenchmarkQueryHandler(
        IPortfolioRepository portfolioRepository,
        Interfaces.IBenchmarkRepository benchmarkRepository)
    {
        _portfolioRepository = portfolioRepository;
        _benchmarkRepository = benchmarkRepository;
    }

    public async Task<BenchmarkComparisonDto> Handle(CompareToBenchmarkQuery request, CancellationToken cancellationToken)
    {
        // Get account info
        var account = await _portfolioRepository.GetAccountAsync(request.AccountId);
        if (account == null)
            throw new KeyNotFoundException($"Account with ID {request.AccountId} not found");

        // Get benchmark info
        var benchmark = await _benchmarkRepository.GetBenchmarkByIdAsync(request.BenchmarkId);
        if (benchmark == null)
            throw new KeyNotFoundException($"Benchmark with ID {request.BenchmarkId} not found");

        // Calculate portfolio TWR - simplified calculation for now
        // In a full implementation, this would use the actual TWR service through MediatR
        var portfolioReturn = 0m; // Placeholder - would need to call CalculateTwrQuery

        // Calculate benchmark return
        var benchmarkReturn = await _benchmarkRepository.CalculateBenchmarkReturnAsync(
            request.BenchmarkId,
            request.StartDate,
            request.EndDate);

        // Calculate active return (portfolio return - benchmark return)
        var activeReturn = portfolioReturn - benchmarkReturn;

        // Get benchmark prices for daily comparison
        var benchmarkPrices = await _benchmarkRepository.GetBenchmarkPricesAsync(
            request.BenchmarkId,
            request.StartDate,
            request.EndDate);

        var benchmarkPriceList = benchmarkPrices.ToList();

        // Calculate tracking error (standard deviation of daily active returns)
        var trackingError = 0m; // Simplified for now - would need daily portfolio values

        // Build daily comparisons
        var dailyComparisons = new List<DailyComparisonDto>();

        if (benchmarkPriceList.Any())
        {
            var initialBenchmarkValue = benchmarkPriceList.First().Value;

            foreach (var price in benchmarkPriceList)
            {
                var benchmarkCumulativeReturn = (price.Value - initialBenchmarkValue) / initialBenchmarkValue;

                dailyComparisons.Add(new DailyComparisonDto
                {
                    Date = price.Date,
                    BenchmarkValue = price.Value,
                    BenchmarkCumulativeReturn = benchmarkCumulativeReturn,
                    PortfolioValue = 0, // Would need to query actual portfolio values
                    PortfolioCumulativeReturn = 0 // Would need to calculate
                });
            }
        }

        return new BenchmarkComparisonDto
        {
            AccountId = request.AccountId,
            AccountName = account.Name,
            BenchmarkId = request.BenchmarkId,
            BenchmarkName = benchmark.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            PortfolioReturn = portfolioReturn,
            BenchmarkReturn = benchmarkReturn,
            ActiveReturn = activeReturn,
            TrackingError = trackingError,
            DailyComparisons = dailyComparisons
        };
    }
}
