using System.ComponentModel.DataAnnotations;

namespace Application.Features.User.DTOs;

public record UserPreferencesDto(
    string Theme
);

public record UpdateUserPreferencesRequest(
    [Required] string Theme
);
