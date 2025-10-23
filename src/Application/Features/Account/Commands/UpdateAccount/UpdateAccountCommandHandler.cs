using Application.Interfaces;
using MediatR;

namespace Application.Features.Account.Commands.UpdateAccount;

public class UpdateAccountCommandHandler : IRequestHandler<UpdateAccountCommand, UpdateAccountResponse>
{
    private readonly IAccountRepository _accountRepository;

    public UpdateAccountCommandHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<UpdateAccountResponse> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetAccountByIdAsync(request.Id, cancellationToken);

        if (account == null)
        {
            throw new KeyNotFoundException($"Account with ID {request.Id} not found");
        }

        // If PortfolioId is provided, verify it exists
        if (request.PortfolioId.HasValue && request.PortfolioId.Value != account.PortfolioId)
        {
            var portfolioExists = await _accountRepository.PortfolioExistsAsync(request.PortfolioId.Value, cancellationToken);

            if (!portfolioExists)
            {
                throw new KeyNotFoundException($"Portfolio with ID {request.PortfolioId.Value} not found");
            }

            account.PortfolioId = request.PortfolioId.Value;
        }

        // Check if another account with same account number already exists
        var existingAccount = await _accountRepository.GetAccountByAccountNumberAsync(request.AccountNumber, cancellationToken);

        if (existingAccount != null && existingAccount.Id != request.Id)
        {
            throw new InvalidOperationException($"Another account with account number '{request.AccountNumber}' already exists");
        }

        account.Name = request.Name;
        account.AccountNumber = request.AccountNumber;
        account.Currency = request.Currency.ToUpperInvariant();
        account.UpdatedAt = DateTime.UtcNow;

        await _accountRepository.UpdateAccountAsync(account, cancellationToken);

        return new UpdateAccountResponse(
            account.Id,
            account.Name,
            account.AccountNumber,
            account.Currency,
            account.PortfolioId,
            account.UpdatedAt
        );
    }
}
