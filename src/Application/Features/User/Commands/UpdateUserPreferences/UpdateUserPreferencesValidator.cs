using FluentValidation;

namespace Application.Features.User.Commands.UpdateUserPreferences;

public class UpdateUserPreferencesValidator : AbstractValidator<UpdateUserPreferencesCommand>
{
    public UpdateUserPreferencesValidator()
    {
        RuleFor(x => x.Theme)
            .NotEmpty()
            .Must(theme => theme == "light" || theme == "dark" || theme == "system")
            .WithMessage("Theme must be 'light', 'dark', or 'system'");
    }
}
