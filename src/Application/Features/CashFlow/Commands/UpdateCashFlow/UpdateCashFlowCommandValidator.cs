using FluentValidation;

namespace Application.Features.CashFlow.Commands.UpdateCashFlow;

public class UpdateCashFlowCommandValidator : AbstractValidator<UpdateCashFlowCommand>
{
    public UpdateCashFlowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Cash flow ID is required");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required")
            .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Today.AddDays(1)))
                .WithMessage("Date cannot be in the future");

        RuleFor(x => x.Amount)
            .NotEqual(0).WithMessage("Amount cannot be zero");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required")
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid cash flow type");

        RuleFor(x => x.Category)
            .IsInEnum().WithMessage("Invalid cash flow category");

        RuleFor(x => x.TransactionReference)
            .MaximumLength(100).WithMessage("Transaction reference cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.TransactionReference));
    }
}
