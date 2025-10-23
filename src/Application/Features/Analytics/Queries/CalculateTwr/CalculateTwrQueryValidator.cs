using FluentValidation;

namespace Application.Features.Analytics.Queries.CalculateTwr;

public class CalculateTwrQueryValidator : AbstractValidator<CalculateTwrQuery>
{
    public CalculateTwrQueryValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty()
            .WithMessage("Account ID is required");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("Start date cannot be in the future");

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("End date cannot be in the future");

        RuleFor(x => x)
            .Must(x => x.StartDate <= x.EndDate)
            .WithMessage("Start date must be before or equal to end date");
    }
}
