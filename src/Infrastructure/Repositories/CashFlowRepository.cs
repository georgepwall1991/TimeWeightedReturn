using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class CashFlowRepository : ICashFlowRepository
{
    private readonly PortfolioContext _context;

    public CashFlowRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<CashFlow?> GetCashFlowByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.CashFlows
            .Include(cf => cf.Account)
            .FirstOrDefaultAsync(cf => cf.Id == id, cancellationToken);
    }

    public async Task<List<CashFlow>> GetCashFlowsAsync(
        Guid? accountId = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        CashFlowCategory? category = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.CashFlows
            .Include(cf => cf.Account)
            .AsQueryable();

        if (accountId.HasValue)
        {
            query = query.Where(cf => cf.AccountId == accountId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(cf => cf.Date >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(cf => cf.Date <= endDate.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(cf => cf.Category == category.Value);
        }

        return await query
            .OrderByDescending(cf => cf.Date)
            .ThenBy(cf => cf.Account.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<CashFlow> CreateCashFlowAsync(CashFlow cashFlow, CancellationToken cancellationToken = default)
    {
        _context.CashFlows.Add(cashFlow);
        await _context.SaveChangesAsync(cancellationToken);
        return cashFlow;
    }

    public async Task UpdateCashFlowAsync(CashFlow cashFlow, CancellationToken cancellationToken = default)
    {
        _context.CashFlows.Update(cashFlow);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteCashFlowAsync(CashFlow cashFlow, CancellationToken cancellationToken = default)
    {
        _context.CashFlows.Remove(cashFlow);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> AccountExistsAsync(Guid accountId, CancellationToken cancellationToken = default)
    {
        return await _context.Accounts.AnyAsync(a => a.Id == accountId, cancellationToken);
    }
}
