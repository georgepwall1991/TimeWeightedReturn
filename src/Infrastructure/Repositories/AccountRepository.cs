using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly PortfolioContext _context;

    public AccountRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<Account?> GetAccountByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts
            .Include(a => a.Portfolio)
                .ThenInclude(p => p.Client)
            .Include(a => a.Holdings)
            .Include(a => a.CashFlows)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<List<Account>> GetAllAccountsAsync(Guid? portfolioId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Accounts
            .Include(a => a.Portfolio)
                .ThenInclude(p => p.Client)
            .Include(a => a.Holdings)
            .Include(a => a.CashFlows)
            .AsQueryable();

        if (portfolioId.HasValue)
        {
            query = query.Where(a => a.PortfolioId == portfolioId.Value);
        }

        return await query
            .OrderBy(a => a.Portfolio.Client.Name)
            .ThenBy(a => a.Portfolio.Name)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Account?> GetAccountByAccountNumberAsync(string accountNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts
            .FirstOrDefaultAsync(a => a.AccountNumber == accountNumber, cancellationToken);
    }

    public async Task<Account> CreateAccountAsync(Account account, CancellationToken cancellationToken = default)
    {
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync(cancellationToken);
        return account;
    }

    public async Task UpdateAccountAsync(Account account, CancellationToken cancellationToken = default)
    {
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAccountAsync(Account account, CancellationToken cancellationToken = default)
    {
        _context.Accounts.Remove(account);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> AccountExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts.AnyAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<bool> PortfolioExistsAsync(Guid portfolioId, CancellationToken cancellationToken = default)
    {
        return await _context.Portfolios.AnyAsync(p => p.Id == portfolioId, cancellationToken);
    }
}
