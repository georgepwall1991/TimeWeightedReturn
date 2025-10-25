using Application.Interfaces;
using Domain.Models;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Reconciliation.Commands;

public record RunReconciliationCommand(
    Guid BatchId,
    DateOnly ReconciliationDate,
    string ReconciliationType, // "Transactions", "Holdings", "Cash", "Prices", "Full"
    MatchingTolerance? Tolerance = null
) : IRequest<ReconciliationResult>;

public class RunReconciliationCommandHandler : IRequestHandler<RunReconciliationCommand, ReconciliationResult>
{
    private readonly IReconciliationService _reconciliationService;

    public RunReconciliationCommandHandler(IReconciliationService reconciliationService)
    {
        _reconciliationService = reconciliationService;
    }

    public async Task<ReconciliationResult> Handle(RunReconciliationCommand request, CancellationToken cancellationToken)
    {
        var tolerance = request.Tolerance ?? MatchingTolerance.Standard;

        return request.ReconciliationType.ToLower() switch
        {
            "transactions" => await _reconciliationService.ReconcileTransactionsAsync(
                request.BatchId, request.ReconciliationDate, tolerance, cancellationToken),

            "holdings" => await _reconciliationService.ReconcileHoldingsAsync(
                request.BatchId, request.ReconciliationDate, tolerance, cancellationToken),

            "cash" => await _reconciliationService.ReconcileCashBalancesAsync(
                request.BatchId, request.ReconciliationDate, tolerance, cancellationToken),

            "prices" => await _reconciliationService.ReconcilePricesAsync(
                request.BatchId, request.ReconciliationDate, tolerance, cancellationToken),

            "full" => await _reconciliationService.RunFullReconciliationAsync(
                request.BatchId, request.ReconciliationDate, tolerance, cancellationToken),

            _ => throw new ArgumentException($"Invalid reconciliation type: {request.ReconciliationType}")
        };
    }
}
