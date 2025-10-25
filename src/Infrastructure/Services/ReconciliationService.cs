using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Domain.Models;
using Domain.ValueObjects;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

/// <summary>
///     Orchestrates the reconciliation workflow between IBoR and ABoR
/// </summary>
public class ReconciliationService : IReconciliationService
{
    private readonly PortfolioContext _context;
    private readonly TransactionMatchingEngine _matchingEngine;

    public ReconciliationService(PortfolioContext context, TransactionMatchingEngine matchingEngine)
    {
        _context = context;
        _matchingEngine = matchingEngine;
    }

    public async Task<ReconciliationResult> ReconcileTransactionsAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default)
    {
        tolerance ??= MatchingTolerance.Standard;

        // Get IBoR transactions from this batch
        var iborTransactions = await _context.CashFlows
            .Where(cf => cf.BatchId == batchId && cf.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        // Get ABoR transactions for the same date and accounts
        var accountIds = iborTransactions.Select(t => t.AccountId).Distinct().ToList();
        var aborTransactions = await _context.CashFlows
            .Where(cf => accountIds.Contains(cf.AccountId) &&
                        cf.Date == reconciliationDate &&
                        cf.BookOfRecord == BookOfRecord.ABoR &&
                        cf.Status == ReconciliationStatus.Approved)
            .ToListAsync(cancellationToken);

        // Run matching
        var result = _matchingEngine.MatchCashFlows(iborTransactions, aborTransactions, tolerance);
        result.BatchId = batchId;
        result.ReconciliationDate = reconciliationDate;

        // Save breaks to database
        await SaveBreaksAsync(result, batchId, cancellationToken);

        // Update batch statistics
        await UpdateBatchStatisticsAsync(batchId, result, cancellationToken);

        return result;
    }

    public async Task<ReconciliationResult> ReconcileHoldingsAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default)
    {
        tolerance ??= MatchingTolerance.Standard;

        // Get IBoR holdings from this batch
        var iborHoldings = await _context.Holdings
            .Where(h => h.BatchId == batchId && h.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        // Get ABoR holdings for the same date and accounts
        var accountIds = iborHoldings.Select(h => h.AccountId).Distinct().ToList();
        var aborHoldings = await _context.Holdings
            .Where(h => accountIds.Contains(h.AccountId) &&
                       h.Date == reconciliationDate &&
                       h.BookOfRecord == BookOfRecord.ABoR &&
                       h.Status == ReconciliationStatus.Approved)
            .ToListAsync(cancellationToken);

        // Run matching
        var result = _matchingEngine.MatchHoldings(iborHoldings, aborHoldings, tolerance);
        result.BatchId = batchId;
        result.ReconciliationDate = reconciliationDate;

        // Save breaks to database
        await SaveBreaksAsync(result, batchId, cancellationToken);

        // Update batch statistics
        await UpdateBatchStatisticsAsync(batchId, result, cancellationToken);

        return result;
    }

    public async Task<ReconciliationResult> ReconcileCashBalancesAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default)
    {
        tolerance ??= MatchingTolerance.Standard;

        var result = new ReconciliationResult
        {
            BatchId = batchId,
            ReconciliationDate = reconciliationDate
        };

        // Get IBoR cash flows for this batch
        var iborCashFlows = await _context.CashFlows
            .Where(cf => cf.BatchId == batchId && cf.BookOfRecord == BookOfRecord.IBoR)
            .GroupBy(cf => cf.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                Balance = g.Sum(cf => cf.Amount)
            })
            .ToListAsync(cancellationToken);

        // Get ABoR cash flows for comparison
        foreach (var iborCash in iborCashFlows)
        {
            var aborBalance = await _context.CashFlows
                .Where(cf => cf.AccountId == iborCash.AccountId &&
                           cf.Date <= reconciliationDate &&
                           cf.BookOfRecord == BookOfRecord.ABoR &&
                           cf.Status == ReconciliationStatus.Approved)
                .SumAsync(cf => cf.Amount, cancellationToken);

            if (!tolerance.AmountsMatch(iborCash.Balance, aborBalance))
            {
                result.Breaks.Add(new ReconciliationBreakInfo
                {
                    BreakId = Guid.NewGuid(),
                    BreakType = ReconciliationBreakType.CashMismatch,
                    EntityType = "CashBalance",
                    Description = "Cash balance mismatch",
                    ExpectedValue = $"IBoR Balance: {iborCash.Balance:C}",
                    ActualValue = $"ABoR Balance: {aborBalance:C}",
                    Variance = iborCash.Balance - aborBalance,
                    AccountId = iborCash.AccountId,
                    BreakDate = reconciliationDate
                });
                result.BreakCount++;
            }
            else
            {
                result.MatchedItems++;
            }

            result.TotalItems++;
        }

        // Save breaks to database
        await SaveBreaksAsync(result, batchId, cancellationToken);

        // Update batch statistics
        await UpdateBatchStatisticsAsync(batchId, result, cancellationToken);

        return result;
    }

    public async Task<ReconciliationResult> ReconcilePricesAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default)
    {
        tolerance ??= MatchingTolerance.Standard;

        // Get IBoR prices from this batch
        var iborPrices = await _context.Prices
            .Where(p => p.BatchId == batchId && p.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        // Get ABoR prices for the same instruments and date
        var instrumentIds = iborPrices.Select(p => p.InstrumentId).Distinct().ToList();
        var aborPrices = await _context.Prices
            .Where(p => instrumentIds.Contains(p.InstrumentId) &&
                       p.Date == reconciliationDate &&
                       p.BookOfRecord == BookOfRecord.ABoR &&
                       p.Status == ReconciliationStatus.Approved)
            .ToListAsync(cancellationToken);

        // Run matching
        var result = _matchingEngine.MatchPrices(iborPrices, aborPrices, tolerance);
        result.BatchId = batchId;
        result.ReconciliationDate = reconciliationDate;

        // Save breaks to database
        await SaveBreaksAsync(result, batchId, cancellationToken);

        // Update batch statistics
        await UpdateBatchStatisticsAsync(batchId, result, cancellationToken);

        return result;
    }

    public async Task<ReconciliationResult> RunFullReconciliationAsync(
        Guid batchId,
        DateOnly reconciliationDate,
        MatchingTolerance? tolerance = null,
        CancellationToken cancellationToken = default)
    {
        tolerance ??= MatchingTolerance.Standard;

        // Run all reconciliation types
        var txnResult = await ReconcileTransactionsAsync(batchId, reconciliationDate, tolerance, cancellationToken);
        var holdingResult = await ReconcileHoldingsAsync(batchId, reconciliationDate, tolerance, cancellationToken);
        var cashResult = await ReconcileCashBalancesAsync(batchId, reconciliationDate, tolerance, cancellationToken);
        var priceResult = await ReconcilePricesAsync(batchId, reconciliationDate, tolerance, cancellationToken);

        // Combine results
        var combinedResult = new ReconciliationResult
        {
            BatchId = batchId,
            ReconciliationDate = reconciliationDate,
            TotalItems = txnResult.TotalItems + holdingResult.TotalItems + cashResult.TotalItems + priceResult.TotalItems,
            MatchedItems = txnResult.MatchedItems + holdingResult.MatchedItems + cashResult.MatchedItems + priceResult.MatchedItems,
            UnmatchedItems = txnResult.UnmatchedItems + holdingResult.UnmatchedItems + cashResult.UnmatchedItems + priceResult.UnmatchedItems,
            BreakCount = txnResult.BreakCount + holdingResult.BreakCount + cashResult.BreakCount + priceResult.BreakCount
        };

        combinedResult.Breaks.AddRange(txnResult.Breaks);
        combinedResult.Breaks.AddRange(holdingResult.Breaks);
        combinedResult.Breaks.AddRange(cashResult.Breaks);
        combinedResult.Breaks.AddRange(priceResult.Breaks);

        return combinedResult;
    }

    public async Task ApproveBatchAsync(
        Guid batchId,
        string approvedBy,
        string? comments = null,
        CancellationToken cancellationToken = default)
    {
        var batch = await _context.ReconciliationBatches
            .FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);

        if (batch == null)
            throw new InvalidOperationException($"Batch {batchId} not found");

        if (batch.Status == ReconciliationStatus.Approved)
            throw new InvalidOperationException($"Batch {batchId} is already approved");

        // Check for unresolved breaks
        var unresolvedBreaks = await _context.ReconciliationBreaks
            .Where(b => b.BatchId == batchId && b.Status == ReconciliationStatus.Break)
            .CountAsync(cancellationToken);

        if (unresolvedBreaks > 0)
            throw new InvalidOperationException($"Cannot approve batch with {unresolvedBreaks} unresolved breaks");

        // Update batch status
        batch.Status = ReconciliationStatus.Approved;
        batch.ApprovedBy = approvedBy;
        batch.ApprovedAt = DateTime.UtcNow;
        batch.Comments = comments;
        batch.UpdatedAt = DateTime.UtcNow;

        // Promote IBoR items to ABoR
        await PromoteIBorToABorAsync(batchId, approvedBy, cancellationToken);

        // Create audit log
        await CreateAuditLogAsync("ReconciliationBatch", batchId, "Approve", approvedBy, comments, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RejectBatchAsync(
        Guid batchId,
        string rejectedBy,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var batch = await _context.ReconciliationBatches
            .FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);

        if (batch == null)
            throw new InvalidOperationException($"Batch {batchId} not found");

        // Update batch status
        batch.Status = ReconciliationStatus.Rejected;
        batch.Comments = reason;
        batch.UpdatedAt = DateTime.UtcNow;

        // Mark all IBoR items in this batch as rejected
        var cashFlows = await _context.CashFlows.Where(cf => cf.BatchId == batchId).ToListAsync(cancellationToken);
        foreach (var cf in cashFlows)
        {
            cf.Status = ReconciliationStatus.Rejected;
            cf.UpdatedAt = DateTime.UtcNow;
        }

        var holdings = await _context.Holdings.Where(h => h.BatchId == batchId).ToListAsync(cancellationToken);
        foreach (var h in holdings)
        {
            h.Status = ReconciliationStatus.Rejected;
            h.UpdatedAt = DateTime.UtcNow;
        }

        var prices = await _context.Prices.Where(p => p.BatchId == batchId).ToListAsync(cancellationToken);
        foreach (var p in prices)
        {
            p.Status = ReconciliationStatus.Rejected;
            p.UpdatedAt = DateTime.UtcNow;
        }

        // Create audit log
        await CreateAuditLogAsync("ReconciliationBatch", batchId, "Reject", rejectedBy, reason, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task ResolveBreakAsync(
        Guid breakId,
        string resolvedBy,
        string resolutionAction,
        string? comments = null,
        CancellationToken cancellationToken = default)
    {
        var breakRecord = await _context.ReconciliationBreaks
            .FirstOrDefaultAsync(b => b.Id == breakId, cancellationToken);

        if (breakRecord == null)
            throw new InvalidOperationException($"Break {breakId} not found");

        breakRecord.Status = ReconciliationStatus.Approved; // Resolved
        breakRecord.ResolvedBy = resolvedBy;
        breakRecord.ResolvedAt = DateTime.UtcNow;
        breakRecord.ResolutionAction = resolutionAction;
        breakRecord.Comments = comments;
        breakRecord.UpdatedAt = DateTime.UtcNow;

        // Create audit log
        await CreateAuditLogAsync("ReconciliationBreak", breakId, "Resolve", resolvedBy, comments, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task SaveBreaksAsync(ReconciliationResult result, Guid batchId, CancellationToken cancellationToken)
    {
        foreach (var breakInfo in result.Breaks)
        {
            var breakEntity = new ReconciliationBreak
            {
                Id = breakInfo.BreakId,
                BatchId = batchId,
                BreakType = breakInfo.BreakType,
                EntityType = breakInfo.EntityType,
                IBorEntityId = result.UnmatchedIBorItems.FirstOrDefault(u => u.EntityType == breakInfo.EntityType)?.EntityId,
                ABorEntityId = result.UnmatchedABorItems.FirstOrDefault(u => u.EntityType == breakInfo.EntityType)?.EntityId,
                AccountId = breakInfo.AccountId,
                InstrumentId = breakInfo.InstrumentId,
                BreakDate = breakInfo.BreakDate,
                Description = breakInfo.Description,
                ExpectedValue = breakInfo.ExpectedValue,
                ActualValue = breakInfo.ActualValue,
                Variance = breakInfo.Variance,
                Status = ReconciliationStatus.Break,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ReconciliationBreaks.Add(breakEntity);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateBatchStatisticsAsync(Guid batchId, ReconciliationResult result, CancellationToken cancellationToken)
    {
        var batch = await _context.ReconciliationBatches.FirstOrDefaultAsync(b => b.Id == batchId, cancellationToken);
        if (batch == null) return;

        batch.MatchedCount = result.MatchedItems;
        batch.BreakCount = result.BreakCount;
        batch.UpdatedAt = DateTime.UtcNow;

        // Auto-approve if fully reconciled
        if (result.IsFullyReconciled && batch.Status == ReconciliationStatus.Pending)
        {
            batch.Status = ReconciliationStatus.Matched;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task PromoteIBorToABorAsync(Guid batchId, string approvedBy, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        // Promote cash flows
        var cashFlows = await _context.CashFlows
            .Where(cf => cf.BatchId == batchId && cf.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        foreach (var cf in cashFlows)
        {
            cf.BookOfRecord = BookOfRecord.ABoR;
            cf.Status = ReconciliationStatus.Approved;
            cf.ApprovedBy = approvedBy;
            cf.ApprovedAt = now;
            cf.UpdatedAt = now;
        }

        // Promote holdings
        var holdings = await _context.Holdings
            .Where(h => h.BatchId == batchId && h.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        foreach (var h in holdings)
        {
            h.BookOfRecord = BookOfRecord.ABoR;
            h.Status = ReconciliationStatus.Approved;
            h.ApprovedBy = approvedBy;
            h.ApprovedAt = now;
            h.UpdatedAt = now;
        }

        // Promote prices
        var prices = await _context.Prices
            .Where(p => p.BatchId == batchId && p.BookOfRecord == BookOfRecord.IBoR)
            .ToListAsync(cancellationToken);

        foreach (var p in prices)
        {
            p.BookOfRecord = BookOfRecord.ABoR;
            p.Status = ReconciliationStatus.Approved;
            p.ApprovedBy = approvedBy;
            p.ApprovedAt = now;
            p.UpdatedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task CreateAuditLogAsync(
        string entityType,
        Guid entityId,
        string action,
        string performedBy,
        string? comments,
        CancellationToken cancellationToken)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            PerformedBy = performedBy,
            PerformedAt = DateTime.UtcNow,
            Comments = comments
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
