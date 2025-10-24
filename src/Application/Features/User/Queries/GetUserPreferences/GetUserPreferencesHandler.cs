using Application.Features.User.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.User.Queries.GetUserPreferences;

public class GetUserPreferencesHandler : IRequestHandler<GetUserPreferencesQuery, UserPreferencesDto>
{
    private readonly IUserPreferencesRepository _repository;

    public GetUserPreferencesHandler(IUserPreferencesRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserPreferencesDto> Handle(GetUserPreferencesQuery request, CancellationToken cancellationToken)
    {
        var preferences = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);

        if (preferences == null)
        {
            // Return default preferences if none exist
            return new UserPreferencesDto(Theme: "system");
        }

        return new UserPreferencesDto(Theme: preferences.Theme);
    }
}
