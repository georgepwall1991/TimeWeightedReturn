using Domain.Entities;

namespace Application.Interfaces;

public interface IUserPreferencesRepository
{
    Task<UserPreferences?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserPreferences> CreateOrUpdateAsync(UserPreferences preferences, CancellationToken cancellationToken = default);
}
