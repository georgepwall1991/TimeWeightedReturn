using Application.Features.Common.Interfaces;
using Application.Features.Common.DTOs;
using Application.Features.Portfolio.DTOs;
using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolioHoldings;

public class GetPortfolioHoldingsHandler : IRequestHandler<GetPortfolioHoldingsQuery, GetPortfolioHoldingsResponse>
{
    private readonly IPortfolioRepository _portfolioRepository;

    public GetPortfolioHoldingsHandler(IPortfolioRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<GetPortfolioHoldingsResponse> Handle(GetPortfolioHoldingsQuery request, CancellationToken cancellationToken)
    {
        var holdingsData = await _portfolioRepository.GetPortfolioHoldingsAsync(request.PortfolioId, request.Date);

        var holdings = holdingsData.Select(h => new Portfolio.DTOs.HoldingDto
        {
            HoldingId = h.HoldingId,
            Ticker = h.Ticker,
            InstrumentName = h.InstrumentName,
            InstrumentType = h.InstrumentType,
            Currency = h.Currency,
            Units = h.Units,
            Price = h.Price,
            LocalValue = h.LocalValue,
            FxRate = h.FxRate,
            ValueGBP = h.ValueGBP,
            Date = h.Date
        }).ToList();

        var totalValue = holdings.Sum(h => h.ValueGBP);

        return new GetPortfolioHoldingsResponse(holdings, totalValue);
    }
}
