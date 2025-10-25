using Application.Interfaces;
using MediatR;

namespace Application.Features.MarketData.Commands;

public record RefreshBenchmarkPriceCommand(Guid BenchmarkId, DateOnly? Date = null) : IRequest<bool>;

public class RefreshBenchmarkPriceCommandHandler : IRequestHandler<RefreshBenchmarkPriceCommand, bool>
{
    private readonly IPriceUpdateService _priceUpdateService;

    public RefreshBenchmarkPriceCommandHandler(IPriceUpdateService priceUpdateService)
    {
        _priceUpdateService = priceUpdateService;
    }

    public async Task<bool> Handle(RefreshBenchmarkPriceCommand request, CancellationToken cancellationToken)
    {
        return await _priceUpdateService.RefreshBenchmarkPriceAsync(request.BenchmarkId, request.Date, cancellationToken);
    }
}
