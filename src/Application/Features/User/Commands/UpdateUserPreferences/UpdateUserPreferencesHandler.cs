using Application.Features.User.DTOs;
using Application.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.User.Commands.UpdateUserPreferences;

public class UpdateUserPreferencesHandler : IRequestHandler<UpdateUserPreferencesCommand, UserPreferencesDto>
{
    private readonly IUserPreferencesRepository _repository;

    public UpdateUserPreferencesHandler(IUserPreferencesRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserPreferencesDto> Handle(UpdateUserPreferencesCommand request, CancellationToken cancellationToken)
    {
        var preferences = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);

        if (preferences == null)
        {
            // Create new preferences
            preferences = new UserPreferences
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                Theme = request.Theme,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
        else
        {
            // Update existing preferences
            preferences.Theme = request.Theme;
            preferences.UpdatedAt = DateTime.UtcNow;
        }

        preferences = await _repository.CreateOrUpdateAsync(preferences, cancellationToken);

        return new UserPreferencesDto(Theme: preferences.Theme);
    }
}
