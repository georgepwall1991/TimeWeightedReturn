using Application.Features.FxRates.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.FxRates.Commands;

public record RefreshAllFxRatesCommand(DateOnly? Date = null) : IRequest<FxRateUpdateStatus>;

public class RefreshAllFxRatesCommandHandler : IRequestHandler<RefreshAllFxRatesCommand, FxRateUpdateStatus>
{
    private readonly IFxRateUpdateService _fxRateUpdateService;

    public RefreshAllFxRatesCommandHandler(IFxRateUpdateService fxRateUpdateService)
    {
        _fxRateUpdateService = fxRateUpdateService;
    }

    public async Task<FxRateUpdateStatus> Handle(RefreshAllFxRatesCommand request, CancellationToken cancellationToken)
    {
        return await _fxRateUpdateService.RefreshAllFxRatesAsync(request.Date, cancellationToken);
    }
}
