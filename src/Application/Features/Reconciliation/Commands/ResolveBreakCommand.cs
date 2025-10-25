using Application.Interfaces;
using MediatR;

namespace Application.Features.Reconciliation.Commands;

public record ResolveBreakCommand(
    Guid BreakId,
    string ResolvedBy,
    string ResolutionAction,
    string? Comments = null
) : IRequest<Unit>;

public class ResolveBreakCommandHandler : IRequestHandler<ResolveBreakCommand, Unit>
{
    private readonly IReconciliationService _reconciliationService;

    public ResolveBreakCommandHandler(IReconciliationService reconciliationService)
    {
        _reconciliationService = reconciliationService;
    }

    public async Task<Unit> Handle(ResolveBreakCommand request, CancellationToken cancellationToken)
    {
        await _reconciliationService.ResolveBreakAsync(
            request.BreakId,
            request.ResolvedBy,
            request.ResolutionAction,
            request.Comments,
            cancellationToken);

        return Unit.Value;
    }
}
