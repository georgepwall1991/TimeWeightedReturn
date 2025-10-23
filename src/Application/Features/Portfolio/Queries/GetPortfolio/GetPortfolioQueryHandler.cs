using Application.Interfaces;
using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolio;

public class GetPortfolioQueryHandler : IRequestHandler<GetPortfolioQuery, GetPortfolioResponse>
{
    private readonly IPortfolioManagementRepository _portfolioRepository;

    public GetPortfolioQueryHandler(IPortfolioManagementRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<GetPortfolioResponse> Handle(GetPortfolioQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Portfolio> portfolios;

        if (request.Id.HasValue)
        {
            var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(request.Id.Value, cancellationToken);
            portfolios = portfolio != null ? new List<Domain.Entities.Portfolio> { portfolio } : new List<Domain.Entities.Portfolio>();
        }
        else
        {
            portfolios = await _portfolioRepository.GetAllPortfoliosAsync(request.ClientId, cancellationToken);
        }

        var portfolioDtos = portfolios.Select(p => new PortfolioDto(
            p.Id,
            p.Name,
            p.ClientId,
            p.Client.Name,
            p.CreatedAt,
            p.UpdatedAt,
            p.Accounts.Count
        )).ToList();

        return new GetPortfolioResponse(portfolioDtos);
    }
}
