using Application.Interfaces;
using MediatR;

namespace Application.Features.CashFlow.Commands.DeleteCashFlow;

public class DeleteCashFlowCommandHandler : IRequestHandler<DeleteCashFlowCommand, DeleteCashFlowResponse>
{
    private readonly ICashFlowRepository _cashFlowRepository;

    public DeleteCashFlowCommandHandler(ICashFlowRepository cashFlowRepository)
    {
        _cashFlowRepository = cashFlowRepository;
    }

    public async Task<DeleteCashFlowResponse> Handle(DeleteCashFlowCommand request, CancellationToken cancellationToken)
    {
        var cashFlow = await _cashFlowRepository.GetCashFlowByIdAsync(request.Id, cancellationToken);

        if (cashFlow == null)
        {
            throw new KeyNotFoundException($"Cash flow with ID {request.Id} not found");
        }

        await _cashFlowRepository.DeleteCashFlowAsync(cashFlow, cancellationToken);

        return new DeleteCashFlowResponse(
            true,
            $"Cash flow '{cashFlow.Description}' dated {cashFlow.Date:yyyy-MM-dd} deleted successfully"
        );
    }
}
