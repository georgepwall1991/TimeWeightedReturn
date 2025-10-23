using Application.Interfaces;
using MediatR;

namespace Application.Features.Portfolio.Commands.CreatePortfolio;

public class CreatePortfolioCommandHandler : IRequestHandler<CreatePortfolioCommand, CreatePortfolioResponse>
{
    private readonly IPortfolioManagementRepository _portfolioRepository;

    public CreatePortfolioCommandHandler(IPortfolioManagementRepository portfolioRepository)
    {
        _portfolioRepository = portfolioRepository;
    }

    public async Task<CreatePortfolioResponse> Handle(CreatePortfolioCommand request, CancellationToken cancellationToken)
    {
        // Verify client exists
        var clientExists = await _portfolioRepository.ClientExistsAsync(request.ClientId, cancellationToken);

        if (!clientExists)
        {
            throw new KeyNotFoundException($"Client with ID {request.ClientId} not found");
        }

        // Check if portfolio with same name already exists for this client
        var existingPortfolio = await _portfolioRepository.GetPortfolioByNameAndClientAsync(request.Name, request.ClientId, cancellationToken);

        if (existingPortfolio != null)
        {
            throw new InvalidOperationException($"A portfolio with the name '{request.Name}' already exists for this client");
        }

        var portfolio = new Domain.Entities.Portfolio
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ClientId = request.ClientId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _portfolioRepository.CreatePortfolioAsync(portfolio, cancellationToken);

        return new CreatePortfolioResponse(
            portfolio.Id,
            portfolio.Name,
            portfolio.ClientId,
            portfolio.CreatedAt
        );
    }
}
