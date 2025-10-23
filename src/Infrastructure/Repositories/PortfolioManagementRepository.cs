using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PortfolioManagementRepository : IPortfolioManagementRepository
{
    private readonly PortfolioContext _context;

    public PortfolioManagementRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<Portfolio?> GetPortfolioByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Portfolios
            .Include(p => p.Client)
            .Include(p => p.Accounts)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<List<Portfolio>> GetAllPortfoliosAsync(Guid? clientId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Portfolios
            .Include(p => p.Client)
            .Include(p => p.Accounts)
            .AsQueryable();

        if (clientId.HasValue)
        {
            query = query.Where(p => p.ClientId == clientId.Value);
        }

        return await query
            .OrderBy(p => p.Client.Name)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Portfolio?> GetPortfolioByNameAndClientAsync(string name, Guid clientId, CancellationToken cancellationToken = default)
    {
        return await _context.Portfolios
            .FirstOrDefaultAsync(p => p.ClientId == clientId && p.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<Portfolio> CreatePortfolioAsync(Portfolio portfolio, CancellationToken cancellationToken = default)
    {
        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync(cancellationToken);
        return portfolio;
    }

    public async Task UpdatePortfolioAsync(Portfolio portfolio, CancellationToken cancellationToken = default)
    {
        _context.Portfolios.Update(portfolio);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeletePortfolioAsync(Portfolio portfolio, CancellationToken cancellationToken = default)
    {
        _context.Portfolios.Remove(portfolio);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> PortfolioExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Portfolios.AnyAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<bool> ClientExistsAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        return await _context.Clients.AnyAsync(c => c.Id == clientId, cancellationToken);
    }
}
