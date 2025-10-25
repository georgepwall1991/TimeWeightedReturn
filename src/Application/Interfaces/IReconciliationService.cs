using Domain.Entities;
using Domain.Models;
using Domain.ValueObjects;

namespace Application.Interfaces;

/// <summary>
///     Service for reconciling IBoR data against ABoR
/// </summary>
public interface IReconciliationService
{
    /// <summary>
    ///     Reconciles transactions for a given batch
    /// </summary>
    Task<ReconciliationResult> ReconcileTransactionsAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Reconciles holdings/positions for a given batch
    /// </summary>
    Task<ReconciliationResult> ReconcileHoldingsAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Reconciles cash balances
    /// </summary>
    Task<ReconciliationResult> ReconcileCashBalancesAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Reconciles prices
    /// </summary>
    Task<ReconciliationResult> ReconcilePricesAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Runs full reconciliation (all data types)
    /// </summary>
    Task<ReconciliationResult> RunFullReconciliationAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Approves a reconciliation batch and promotes IBoR to ABoR
    /// </summary>
    Task ApproveBatchAsync(
        Guid batchId,
        string approvedBy,
        string? comments = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Rejects a reconciliation batch
    /// </summary>
    Task RejectBatchAsync(
        Guid batchId,
        string rejectedBy,
        string reason,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Resolves a reconciliation break
    /// </summary>
    Task ResolveBreakAsync(
        Guid breakId,
        string resolvedBy,
        string resolutionAction,
        string? comments = null,
        CancellationToken cancellationToken = default);
}
