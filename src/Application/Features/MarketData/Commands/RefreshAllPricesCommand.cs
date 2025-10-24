using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.MarketData.Commands;

public record RefreshAllPricesCommand(DateOnly? Date = null) : IRequest<MarketDataStatus>;

public class RefreshAllPricesCommandHandler : IRequestHandler<RefreshAllPricesCommand, MarketDataStatus>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public RefreshAllPricesCommandHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<MarketDataStatus> Handle(RefreshAllPricesCommand request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.RefreshAllPricesAsync(request.Date, cancellationToken);
    }
}
