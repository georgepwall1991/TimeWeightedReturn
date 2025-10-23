using FluentValidation;

namespace Application.Features.Portfolio.Commands.UpdatePortfolio;

public class UpdatePortfolioCommandValidator : AbstractValidator<UpdatePortfolioCommand>
{
    public UpdatePortfolioCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Portfolio ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Portfolio name is required")
            .MaximumLength(200).WithMessage("Portfolio name cannot exceed 200 characters")
            .MinimumLength(2).WithMessage("Portfolio name must be at least 2 characters");
    }
}
