using Application.Interfaces;
using MediatR;

namespace Application.Features.Account.Queries.GetAccount;

public class GetAccountQueryHandler : IRequestHandler<GetAccountQuery, GetAccountResponse>
{
    private readonly IAccountRepository _accountRepository;

    public GetAccountQueryHandler(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<GetAccountResponse> Handle(GetAccountQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Account> accounts;

        if (request.Id.HasValue)
        {
            var account = await _accountRepository.GetAccountByIdAsync(request.Id.Value, cancellationToken);
            accounts = account != null ? new List<Domain.Entities.Account> { account } : new List<Domain.Entities.Account>();
        }
        else
        {
            accounts = await _accountRepository.GetAllAccountsAsync(request.PortfolioId, cancellationToken);
        }

        var accountDtos = accounts.Select(a => new AccountDto(
            a.Id,
            a.Name,
            a.AccountNumber,
            a.Currency,
            a.PortfolioId,
            a.Portfolio.Name,
            a.Portfolio.Client.Name,
            a.CreatedAt,
            a.UpdatedAt,
            a.Holdings.Count,
            a.CashFlows.Count
        )).ToList();

        return new GetAccountResponse(accountDtos);
    }
}
