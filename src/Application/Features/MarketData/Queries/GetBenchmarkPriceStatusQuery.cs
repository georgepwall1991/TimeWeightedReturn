using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.MarketData.Queries;

public record GetBenchmarkPriceStatusQuery : IRequest<IEnumerable<BenchmarkPriceStatus>>;

public class GetBenchmarkPriceStatusQueryHandler : IRequestHandler<GetBenchmarkPriceStatusQuery, IEnumerable<BenchmarkPriceStatus>>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public GetBenchmarkPriceStatusQueryHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<IEnumerable<BenchmarkPriceStatus>> Handle(GetBenchmarkPriceStatusQuery request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.GetBenchmarkPriceStatusAsync(cancellationToken);
    }
}
