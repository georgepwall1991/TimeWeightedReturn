using Application.Features.User.DTOs;
using MediatR;

namespace Application.Features.User.Queries.GetUserPreferences;

public record GetUserPreferencesQuery(Guid UserId) : IRequest<UserPreferencesDto>;
