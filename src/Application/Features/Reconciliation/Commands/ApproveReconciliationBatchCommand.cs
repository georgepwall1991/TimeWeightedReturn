using Application.Interfaces;
using MediatR;

namespace Application.Features.Reconciliation.Commands;

public record ApproveReconciliationBatchCommand(
    Guid BatchId,
    string ApprovedBy,
    string? Comments = null
) : IRequest<Unit>;

public class ApproveReconciliationBatchCommandHandler : IRequestHandler<ApproveReconciliationBatchCommand, Unit>
{
    private readonly IReconciliationService _reconciliationService;

    public ApproveReconciliationBatchCommandHandler(IReconciliationService reconciliationService)
    {
        _reconciliationService = reconciliationService;
    }

    public async Task<Unit> Handle(ApproveReconciliationBatchCommand request, CancellationToken cancellationToken)
    {
        await _reconciliationService.ApproveBatchAsync(
            request.BatchId,
            request.ApprovedBy,
            request.Comments,
            cancellationToken);

        return Unit.Value;
    }
}
