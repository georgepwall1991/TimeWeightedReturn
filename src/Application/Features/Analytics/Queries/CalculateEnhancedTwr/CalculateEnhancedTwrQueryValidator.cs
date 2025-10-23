using FluentValidation;

namespace Application.Features.Analytics.Queries.CalculateEnhancedTwr;

public class CalculateEnhancedTwrQueryValidator : AbstractValidator<CalculateEnhancedTwrQuery>
{
    public CalculateEnhancedTwrQueryValidator()
    {
        RuleFor(x => x.AccountId)
            .NotEmpty()
            .WithMessage("Account ID is required");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start date is required")
            .LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("Start date must be before or equal to end date");

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today.AddDays(1)))
            .WithMessage("End date cannot be in the future");

        RuleFor(x => x)
            .Must(x => (x.EndDate.ToDateTime(TimeOnly.MinValue) - x.StartDate.ToDateTime(TimeOnly.MinValue)).Days >= 1)
            .WithMessage("Period must be at least 1 day");
    }
}
