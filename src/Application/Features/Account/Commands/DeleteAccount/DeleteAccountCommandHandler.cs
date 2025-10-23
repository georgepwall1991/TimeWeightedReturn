using Application.Interfaces;
using MediatR;

namespace Application.Features.Account.Commands.DeleteAccount;

public class DeleteAccountCommandHandler : IRequestHandler<DeleteAccountCommand, DeleteAccountResponse>
{
    private readonly IAccountRepository _accountRepository;

    public DeleteAccountCommandHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<DeleteAccountResponse> Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetAccountByIdAsync(request.Id, cancellationToken);

        if (account == null)
        {
            throw new KeyNotFoundException($"Account with ID {request.Id} not found");
        }

        // Check if account has any holdings
        if (account.Holdings.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete account '{account.Name}' because it has {account.Holdings.Count} holding(s). " +
                "Please delete all holdings first.");
        }

        // Check if account has any cash flows
        if (account.CashFlows.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete account '{account.Name}' because it has {account.CashFlows.Count} cash flow(s). " +
                "Please delete all cash flows first.");
        }

        await _accountRepository.DeleteAccountAsync(account, cancellationToken);

        return new DeleteAccountResponse(true, $"Account '{account.Name}' deleted successfully");
    }
}
