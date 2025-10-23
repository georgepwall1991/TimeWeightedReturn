using FluentValidation;

namespace Application.Features.CashFlow.Commands.DeleteCashFlow;

public class DeleteCashFlowCommandValidator : AbstractValidator<DeleteCashFlowCommand>
{
    public DeleteCashFlowCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Cash flow ID is required");
    }
}
