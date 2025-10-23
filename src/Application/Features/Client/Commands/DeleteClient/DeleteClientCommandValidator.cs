using FluentValidation;

namespace Application.Features.Client.Commands.DeleteClient;

public class DeleteClientCommandValidator : AbstractValidator<DeleteClientCommand>
{
    public DeleteClientCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Client ID is required");
    }
}
