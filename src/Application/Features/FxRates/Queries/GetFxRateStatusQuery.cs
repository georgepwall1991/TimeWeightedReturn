using Application.Features.FxRates.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.FxRates.Queries;

public record GetFxRateStatusQuery : IRequest<IEnumerable<CurrencyPairStatus>>;

public class GetFxRateStatusQueryHandler : IRequestHandler<GetFxRateStatusQuery, IEnumerable<CurrencyPairStatus>>
{
    private readonly IFxRateUpdateService _fxRateUpdateService;

    public GetFxRateStatusQueryHandler(IFxRateUpdateService fxRateUpdateService)
    {
        _fxRateUpdateService = fxRateUpdateService;
    }

    public async Task<IEnumerable<CurrencyPairStatus>> Handle(GetFxRateStatusQuery request, CancellationToken cancellationToken)
    {
        return await _fxRateUpdateService.GetFxRateStatusAsync(cancellationToken);
    }
}
