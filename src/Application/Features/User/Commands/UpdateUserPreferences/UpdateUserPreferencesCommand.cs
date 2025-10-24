using Application.Features.User.DTOs;
using MediatR;

namespace Application.Features.User.Commands.UpdateUserPreferences;

public record UpdateUserPreferencesCommand(
    Guid UserId,
    string Theme
) : IRequest<UserPreferencesDto>;
