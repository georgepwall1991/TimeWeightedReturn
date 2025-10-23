using Application.Interfaces;
using MediatR;

namespace Application.Features.CashFlow.Commands.UpdateCashFlow;

public class UpdateCashFlowCommandHandler : IRequestHandler<UpdateCashFlowCommand, UpdateCashFlowResponse>
{
    private readonly ICashFlowRepository _cashFlowRepository;

    public UpdateCashFlowCommandHandler(ICashFlowRepository cashFlowRepository)
    {
        _cashFlowRepository = cashFlowRepository;
    }

    public async Task<UpdateCashFlowResponse> Handle(UpdateCashFlowCommand request, CancellationToken cancellationToken)
    {
        var cashFlow = await _cashFlowRepository.GetCashFlowByIdAsync(request.Id, cancellationToken);

        if (cashFlow == null)
        {
            throw new KeyNotFoundException($"Cash flow with ID {request.Id} not found");
        }

        cashFlow.Date = request.Date;
        cashFlow.Amount = request.Amount;
        cashFlow.Description = request.Description;
        cashFlow.Type = request.Type;
        cashFlow.Category = request.Category;
        cashFlow.TransactionReference = request.TransactionReference;
        cashFlow.UpdatedAt = DateTime.UtcNow;

        await _cashFlowRepository.UpdateCashFlowAsync(cashFlow, cancellationToken);

        return new UpdateCashFlowResponse(
            cashFlow.Id,
            cashFlow.AccountId,
            cashFlow.Date,
            cashFlow.Amount,
            cashFlow.Description,
            cashFlow.Type,
            cashFlow.Category,
            cashFlow.TransactionReference,
            cashFlow.UpdatedAt
        );
    }
}
