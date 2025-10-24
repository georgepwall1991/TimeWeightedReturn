using Application.Features.MarketData.DTOs;
using Application.Interfaces;
using Application.Services.MarketData;
using MediatR;

namespace Application.Features.MarketData.Queries;

public record GetMarketDataStatusQuery : IRequest<IEnumerable<InstrumentPriceStatus>>;

public class GetMarketDataStatusQueryHandler : IRequestHandler<GetMarketDataStatusQuery, IEnumerable<InstrumentPriceStatus>>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public GetMarketDataStatusQueryHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<IEnumerable<InstrumentPriceStatus>> Handle(GetMarketDataStatusQuery request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.GetInstrumentPriceStatusAsync(cancellationToken);
    }
}
