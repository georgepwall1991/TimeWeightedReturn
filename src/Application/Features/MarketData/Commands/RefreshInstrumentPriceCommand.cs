using Application.Interfaces;
using MediatR;

namespace Application.Features.MarketData.Commands;

public record RefreshInstrumentPriceCommand(Guid InstrumentId, DateOnly? Date = null) : IRequest<bool>;

public class RefreshInstrumentPriceCommandHandler : IRequestHandler<RefreshInstrumentPriceCommand, bool>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public RefreshInstrumentPriceCommandHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<bool> Handle(RefreshInstrumentPriceCommand request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.RefreshInstrumentPriceAsync(request.InstrumentId, request.Date, cancellationToken);
    }
}
