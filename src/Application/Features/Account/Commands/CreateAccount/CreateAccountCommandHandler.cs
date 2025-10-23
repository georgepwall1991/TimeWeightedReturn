using Application.Interfaces;
using MediatR;

namespace Application.Features.Account.Commands.CreateAccount;

public class CreateAccountCommandHandler : IRequestHandler<CreateAccountCommand, CreateAccountResponse>
{
    private readonly IAccountRepository _accountRepository;

    public CreateAccountCommandHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<CreateAccountResponse> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        // Verify portfolio exists
        var portfolioExists = await _accountRepository.PortfolioExistsAsync(request.PortfolioId, cancellationToken);

        if (!portfolioExists)
        {
            throw new KeyNotFoundException($"Portfolio with ID {request.PortfolioId} not found");
        }

        // Check if account with same account number already exists
        var existingAccount = await _accountRepository.GetAccountByAccountNumberAsync(request.AccountNumber, cancellationToken);

        if (existingAccount != null)
        {
            throw new InvalidOperationException($"An account with account number '{request.AccountNumber}' already exists");
        }

        var account = new Domain.Entities.Account
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            AccountNumber = request.AccountNumber,
            Currency = request.Currency.ToUpperInvariant(),
            PortfolioId = request.PortfolioId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _accountRepository.CreateAccountAsync(account, cancellationToken);

        return new CreateAccountResponse(
            account.Id,
            account.Name,
            account.AccountNumber,
            account.Currency,
            account.PortfolioId,
            account.CreatedAt
        );
    }
}
