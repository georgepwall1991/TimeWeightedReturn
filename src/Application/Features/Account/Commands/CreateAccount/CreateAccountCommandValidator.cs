using FluentValidation;

namespace Application.Features.Account.Commands.CreateAccount;

public class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand>
{
    public CreateAccountCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Account name is required")
            .MaximumLength(200).WithMessage("Account name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Account name must be at least 2 characters");

        RuleFor(x => x.AccountNumber)
            .NotEmpty().WithMessage("Account number is required")
            .MaximumLength(50).WithMessage("Account number cannot exceed 50 characters");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be a 3-letter ISO code (e.g., GBP, USD)")
            .Matches("^[A-Z]{3}$").WithMessage("Currency must be uppercase ISO code");

        RuleFor(x => x.PortfolioId)
            .NotEmpty().WithMessage("Portfolio ID is required");
    }
}
