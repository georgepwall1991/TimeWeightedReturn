using Application.Interfaces;
using MediatR;

namespace Application.Features.FxRates.Commands;

public record RefreshFxRateCommand(
    string BaseCurrency,
    string QuoteCurrency,
    DateOnly? Date = null) : IRequest<bool>;

public class RefreshFxRateCommandHandler : IRequestHandler<RefreshFxRateCommand, bool>
{
    private readonly IFxRateUpdateService _fxRateUpdateService;

    public RefreshFxRateCommandHandler(IFxRateUpdateService fxRateUpdateService)
    {
        _fxRateUpdateService = fxRateUpdateService;
    }

    public async Task<bool> Handle(RefreshFxRateCommand request, CancellationToken cancellationToken)
    {
        return await _fxRateUpdateService.RefreshFxRateAsync(
            request.BaseCurrency,
            request.QuoteCurrency,
            request.Date,
            cancellationToken);
    }
}
