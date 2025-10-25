using Application.Interfaces;
using MediatR;

namespace Application.Features.Reconciliation.Commands;

public record RejectReconciliationBatchCommand(
    Guid BatchId,
    string RejectedBy,
    string Reason
) : IRequest<Unit>;

public class RejectReconciliationBatchCommandHandler : IRequestHandler<RejectReconciliationBatchCommand, Unit>
{
    private readonly IReconciliationService _reconciliationService;

    public RejectReconciliationBatchCommandHandler(IReconciliationService reconciliationService)
    {
        _reconciliationService = reconciliationService;
    }

    public async Task<Unit> Handle(RejectReconciliationBatchCommand request, CancellationToken cancellationToken)
    {
        await _reconciliationService.RejectBatchAsync(
            request.BatchId,
            request.RejectedBy,
            request.Reason,
            cancellationToken);

        return Unit.Value;
    }
}
