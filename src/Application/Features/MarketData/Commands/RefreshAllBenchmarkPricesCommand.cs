using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.MarketData.Commands;

public record RefreshAllBenchmarkPricesCommand(DateOnly? Date = null) : IRequest<MarketDataStatus>;

public class RefreshAllBenchmarkPricesCommandHandler : IRequestHandler<RefreshAllBenchmarkPricesCommand, MarketDataStatus>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public RefreshAllBenchmarkPricesCommandHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<MarketDataStatus> Handle(RefreshAllBenchmarkPricesCommand request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.RefreshAllBenchmarkPricesAsync(request.Date, cancellationToken);
    }
}
