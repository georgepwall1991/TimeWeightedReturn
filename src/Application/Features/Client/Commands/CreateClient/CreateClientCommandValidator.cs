using FluentValidation;

namespace Application.Features.Client.Commands.CreateClient;

public class CreateClientCommandValidator : AbstractValidator<CreateClientCommand>
{
    public CreateClientCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Client name is required")
            .MaximumLength(200).WithMessage("Client name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Client name must be at least 2 characters");
    }
}
