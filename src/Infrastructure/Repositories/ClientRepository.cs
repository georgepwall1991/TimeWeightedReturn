using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly PortfolioContext _context;

    public ClientRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<Client?> GetClientByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Clients
            .Include(c => c.Portfolios)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<List<Client>> GetAllClientsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Clients
            .Include(c => c.Portfolios)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Client?> GetClientByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await _context.Clients
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<Client> CreateClientAsync(Client client, CancellationToken cancellationToken = default)
    {
        _context.Clients.Add(client);
        await _context.SaveChangesAsync(cancellationToken);
        return client;
    }

    public async Task UpdateClientAsync(Client client, CancellationToken cancellationToken = default)
    {
        _context.Clients.Update(client);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteClientAsync(Client client, CancellationToken cancellationToken = default)
    {
        _context.Clients.Remove(client);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> ClientExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Clients.AnyAsync(c => c.Id == id, cancellationToken);
    }
}
