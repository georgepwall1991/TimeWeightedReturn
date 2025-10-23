using Application.Interfaces;
using MediatR;

namespace Application.Features.Portfolio.Commands.DeletePortfolio;

public class DeletePortfolioCommandHandler : IRequestHandler<DeletePortfolioCommand, DeletePortfolioResponse>
{
    private readonly IPortfolioManagementRepository _portfolioRepository;

    public DeletePortfolioCommandHandler(IPortfolioManagementRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<DeletePortfolioResponse> Handle(DeletePortfolioCommand request, CancellationToken cancellationToken)
    {
        var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(request.Id, cancellationToken);

        if (portfolio == null)
        {
            throw new KeyNotFoundException($"Portfolio with ID {request.Id} not found");
        }

        // Check if portfolio has any accounts
        if (portfolio.Accounts.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete portfolio '{portfolio.Name}' because it has {portfolio.Accounts.Count} account(s). " +
                "Please delete all accounts first.");
        }

        await _portfolioRepository.DeletePortfolioAsync(portfolio, cancellationToken);

        return new DeletePortfolioResponse(true, $"Portfolio '{portfolio.Name}' deleted successfully");
    }
}
