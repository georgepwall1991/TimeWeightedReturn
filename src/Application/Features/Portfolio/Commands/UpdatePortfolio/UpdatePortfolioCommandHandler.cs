using Application.Interfaces;
using MediatR;

namespace Application.Features.Portfolio.Commands.UpdatePortfolio;

public class UpdatePortfolioCommandHandler : IRequestHandler<UpdatePortfolioCommand, UpdatePortfolioResponse>
{
    private readonly IPortfolioManagementRepository _portfolioRepository;

    public UpdatePortfolioCommandHandler(IPortfolioManagementRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<UpdatePortfolioResponse> Handle(UpdatePortfolioCommand request, CancellationToken cancellationToken)
    {
        var portfolio = await _portfolioRepository.GetPortfolioByIdAsync(request.Id, cancellationToken);

        if (portfolio == null)
        {
            throw new KeyNotFoundException($"Portfolio with ID {request.Id} not found");
        }

        // If ClientId is provided, verify it exists
        if (request.ClientId.HasValue && request.ClientId.Value != portfolio.ClientId)
        {
            var clientExists = await _portfolioRepository.ClientExistsAsync(request.ClientId.Value, cancellationToken);

            if (!clientExists)
            {
                throw new KeyNotFoundException($"Client with ID {request.ClientId.Value} not found");
            }

            portfolio.ClientId = request.ClientId.Value;
        }

        // Check if another portfolio with same name already exists for this client
        var existingPortfolio = await _portfolioRepository.GetPortfolioByNameAndClientAsync(request.Name, portfolio.ClientId, cancellationToken);

        if (existingPortfolio != null && existingPortfolio.Id != request.Id)
        {
            throw new InvalidOperationException($"Another portfolio with the name '{request.Name}' already exists for this client");
        }

        portfolio.Name = request.Name;
        portfolio.UpdatedAt = DateTime.UtcNow;

        await _portfolioRepository.UpdatePortfolioAsync(portfolio, cancellationToken);

        return new UpdatePortfolioResponse(
            portfolio.Id,
            portfolio.Name,
            portfolio.ClientId,
            portfolio.UpdatedAt
        );
    }
}
