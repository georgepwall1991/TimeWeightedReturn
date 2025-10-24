using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserPreferencesRepository : IUserPreferencesRepository
{
    private readonly PortfolioContext _context;

    public UserPreferencesRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<UserPreferences?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task<UserPreferences> CreateOrUpdateAsync(UserPreferences preferences, CancellationToken cancellationToken = default)
    {
        var existing = await _context.UserPreferences
            .FirstOrDefaultAsync(p => p.UserId == preferences.UserId, cancellationToken);

        if (existing == null)
        {
            _context.UserPreferences.Add(preferences);
        }
        else
        {
            existing.Theme = preferences.Theme;
            existing.UpdatedAt = preferences.UpdatedAt;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return existing ?? preferences;
    }
}
