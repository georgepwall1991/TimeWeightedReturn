using FluentValidation;

namespace Application.Features.Portfolio.Commands.CreatePortfolio;

public class CreatePortfolioCommandValidator : AbstractValidator<CreatePortfolioCommand>
{
    public CreatePortfolioCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Portfolio name is required")
            .MaximumLength(200).WithMessage("Portfolio name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Portfolio name must be at least 2 characters");

        RuleFor(x => x.ClientId)
            .NotEmpty().WithMessage("Client ID is required");
    }
}
