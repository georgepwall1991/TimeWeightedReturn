using Application.Services.MarketData;
using MediatR;

namespace Application.Features.MarketData.Queries;

public record ValidateTickerQuery(string Ticker) : IRequest<bool>;

public class ValidateTickerQueryHandler : IRequestHandler<ValidateTickerQuery, bool>
{
    private readonly IMarketDataService _marketDataService;

    public ValidateTickerQueryHandler(IMarketDataService marketDataService)
    {
        _marketDataService = marketDataService;
    }

    public async Task<bool> Handle(ValidateTickerQuery request, CancellationToken cancellationToken)
    {
        return await _marketDataService.ValidateTickerAsync(request.Ticker, cancellationToken);
    }
}
