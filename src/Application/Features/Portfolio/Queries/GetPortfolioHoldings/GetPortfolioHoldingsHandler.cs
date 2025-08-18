using Application.Services;
using Domain.Interfaces;
using Application.Features.Portfolio.DTOs;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Portfolio.Queries.GetPortfolioHoldings
{
    public class GetPortfolioHoldingsHandler : IRequestHandler<GetPortfolioHoldingsQuery, GetPortfolioHoldingsResponse>
    {
        private readonly IPortfolioRepository _portfolioRepository;
        private readonly IHoldingMapperService _holdingMapperService;

        public GetPortfolioHoldingsHandler(IPortfolioRepository portfolioRepository, IHoldingMapperService holdingMapperService)
        {
            _portfolioRepository = portfolioRepository;
            _holdingMapperService = holdingMapperService;
        }

        public async Task<GetPortfolioHoldingsResponse> Handle(GetPortfolioHoldingsQuery request, CancellationToken cancellationToken)
        {
            var holdings = await _portfolioRepository.GetPortfolioHoldingsAsync(request.PortfolioId, request.Date);
            var holdingDtos = await _holdingMapperService.MapHoldingsToDtosAsync(holdings, request.Date);
            var totalValue = holdingDtos.Sum(h => h.ValueGBP);

            return new GetPortfolioHoldingsResponse(holdingDtos, totalValue);
        }
    }
}
