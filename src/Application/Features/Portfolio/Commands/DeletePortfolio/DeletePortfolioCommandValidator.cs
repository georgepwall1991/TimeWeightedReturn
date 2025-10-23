using FluentValidation;

namespace Application.Features.Portfolio.Commands.DeletePortfolio;

public class DeletePortfolioCommandValidator : AbstractValidator<DeletePortfolioCommand>
{
    public DeletePortfolioCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Portfolio ID is required");
    }
}
