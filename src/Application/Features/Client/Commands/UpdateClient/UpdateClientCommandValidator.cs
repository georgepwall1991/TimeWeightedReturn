using FluentValidation;

namespace Application.Features.Client.Commands.UpdateClient;

public class UpdateClientCommandValidator : AbstractValidator<UpdateClientCommand>
{
    public UpdateClientCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Client ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Client name is required")
            .MaximumLength(200).WithMessage("Client name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Client name must be at least 2 characters");
    }
}
