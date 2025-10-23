using FluentValidation;

namespace Application.Features.Account.Commands.DeleteAccount;

public class DeleteAccountCommandValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Account ID is required");
    }
}
