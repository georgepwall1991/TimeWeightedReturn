using Domain.Entities;
using Domain.Enums;
using Domain.Models;
using Domain.ValueObjects;

namespace Infrastructure.Services;

/// <summary>
///     Engine for matching transactions between IBoR and ABoR
/// </summary>
public class TransactionMatchingEngine
{
    /// <summary>
    ///     Matches cash flows between IBoR and ABoR
    /// </summary>
    public ReconciliationResult MatchCashFlows(
        List<CashFlow> iborTransactions,
        List<CashFlow> aborTransactions,
        MatchingTolerance tolerance)
    {
        var result = new ReconciliationResult
        {
            ReconciliationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalItems = iborTransactions.Count
        };

        var unmatchedIBor = new List<CashFlow>(iborTransactions);
        var unmatchedABor = new List<CashFlow>(aborTransactions);

        // Match transactions
        foreach (var iborTxn in iborTransactions)
        {
            var match = FindBestMatch(iborTxn, unmatchedABor, tolerance);

            if (match.Item1 != null)
            {
                // Found a match
                var aborTxn = match.Item1;
                var isExactMatch = match.Item2;

                result.MatchedTransactions.Add(new MatchedItemInfo
                {
                    IBorEntityId = iborTxn.Id,
                    ABorEntityId = aborTxn.Id,
                    EntityType = "CashFlow",
                    Date = iborTxn.Date,
                    Amount = iborTxn.Amount,
                    IsExactMatch = isExactMatch,
                    Difference = Math.Abs(iborTxn.Amount - aborTxn.Amount)
                });

                unmatchedIBor.Remove(iborTxn);
                unmatchedABor.Remove(aborTxn);
                result.MatchedItems++;
            }
        }

        // Create breaks for unmatched items
        foreach (var iborTxn in unmatchedIBor)
        {
            result.Breaks.Add(new ReconciliationBreakInfo
            {
                BreakId = Guid.NewGuid(),
                BreakType = ReconciliationBreakType.MissingTransaction,
                EntityType = "CashFlow",
                Description = $"Transaction in IBoR not found in ABoR: {iborTxn.Description}",
                ExpectedValue = $"Amount: {iborTxn.Amount:C}, Date: {iborTxn.Date}",
                ActualValue = "Not found in ABoR",
                Variance = iborTxn.Amount,
                AccountId = iborTxn.AccountId,
                BreakDate = iborTxn.Date
            });

            result.UnmatchedIBorItems.Add(new UnmatchedItemInfo
            {
                EntityId = iborTxn.Id,
                Source = BookOfRecord.IBoR,
                EntityType = "CashFlow",
                Date = iborTxn.Date,
                Amount = iborTxn.Amount,
                Description = iborTxn.Description
            });

            result.BreakCount++;
        }

        foreach (var aborTxn in unmatchedABor)
        {
            result.Breaks.Add(new ReconciliationBreakInfo
            {
                BreakId = Guid.NewGuid(),
                BreakType = ReconciliationBreakType.MissingTransaction,
                EntityType = "CashFlow",
                Description = $"Transaction in ABoR not found in IBoR: {aborTxn.Description}",
                ExpectedValue = "Expected in IBoR",
                ActualValue = $"Amount: {aborTxn.Amount:C}, Date: {aborTxn.Date}",
                Variance = aborTxn.Amount,
                AccountId = aborTxn.AccountId,
                BreakDate = aborTxn.Date
            });

            result.UnmatchedABorItems.Add(new UnmatchedItemInfo
            {
                EntityId = aborTxn.Id,
                Source = BookOfRecord.ABoR,
                EntityType = "CashFlow",
                Date = aborTxn.Date,
                Amount = aborTxn.Amount,
                Description = aborTxn.Description
            });

            result.BreakCount++;
        }

        result.UnmatchedItems = unmatchedIBor.Count + unmatchedABor.Count;

        return result;
    }

    /// <summary>
    ///     Matches holdings between IBoR and ABoR
    /// </summary>
    public ReconciliationResult MatchHoldings(
        List<Holding> iborHoldings,
        List<Holding> aborHoldings,
        MatchingTolerance tolerance)
    {
        var result = new ReconciliationResult
        {
            ReconciliationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalItems = iborHoldings.Count
        };

        var unmatchedIBor = new List<Holding>(iborHoldings);
        var unmatchedABor = new List<Holding>(aborHoldings);

        // Match holdings
        foreach (var iborHolding in iborHoldings)
        {
            var match = FindBestHoldingMatch(iborHolding, unmatchedABor, tolerance);

            if (match.Item1 != null)
            {
                var aborHolding = match.Item1;
                var isExactMatch = match.Item2;

                result.MatchedTransactions.Add(new MatchedItemInfo
                {
                    IBorEntityId = iborHolding.Id,
                    ABorEntityId = aborHolding.Id,
                    EntityType = "Holding",
                    Date = iborHolding.Date,
                    Amount = iborHolding.Units,
                    IsExactMatch = isExactMatch,
                    Difference = Math.Abs(iborHolding.Units - aborHolding.Units)
                });

                unmatchedIBor.Remove(iborHolding);
                unmatchedABor.Remove(aborHolding);
                result.MatchedItems++;
            }
            else
            {
                // Check if there's a quantity mismatch
                var sameInstrumentHolding = aborHoldings.FirstOrDefault(h =>
                    h.AccountId == iborHolding.AccountId &&
                    h.InstrumentId == iborHolding.InstrumentId &&
                    h.Date == iborHolding.Date);

                if (sameInstrumentHolding != null)
                {
                    // Quantity mismatch
                    result.Breaks.Add(new ReconciliationBreakInfo
                    {
                        BreakId = Guid.NewGuid(),
                        BreakType = ReconciliationBreakType.QuantityMismatch,
                        EntityType = "Holding",
                        Description = "Position quantity mismatch",
                        ExpectedValue = $"Units: {iborHolding.Units:N6}",
                        ActualValue = $"Units: {sameInstrumentHolding.Units:N6}",
                        Variance = iborHolding.Units - sameInstrumentHolding.Units,
                        AccountId = iborHolding.AccountId,
                        InstrumentId = iborHolding.InstrumentId,
                        BreakDate = iborHolding.Date
                    });
                    result.BreakCount++;
                }
            }
        }

        // Create breaks for unmatched items
        foreach (var iborHolding in unmatchedIBor)
        {
            result.UnmatchedIBorItems.Add(new UnmatchedItemInfo
            {
                EntityId = iborHolding.Id,
                Source = BookOfRecord.IBoR,
                EntityType = "Holding",
                Date = iborHolding.Date,
                Units = iborHolding.Units
            });
            result.BreakCount++;
        }

        foreach (var aborHolding in unmatchedABor)
        {
            result.UnmatchedABorItems.Add(new UnmatchedItemInfo
            {
                EntityId = aborHolding.Id,
                Source = BookOfRecord.ABoR,
                EntityType = "Holding",
                Date = aborHolding.Date,
                Units = aborHolding.Units
            });
            result.BreakCount++;
        }

        result.UnmatchedItems = unmatchedIBor.Count + unmatchedABor.Count;

        return result;
    }

    /// <summary>
    ///     Matches prices between IBoR and ABoR
    /// </summary>
    public ReconciliationResult MatchPrices(
        List<Price> iborPrices,
        List<Price> aborPrices,
        MatchingTolerance tolerance)
    {
        var result = new ReconciliationResult
        {
            ReconciliationDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalItems = iborPrices.Count
        };

        var unmatchedIBor = new List<Price>(iborPrices);
        var unmatchedABor = new List<Price>(aborPrices);

        // Match prices
        foreach (var iborPrice in iborPrices)
        {
            var match = FindBestPriceMatch(iborPrice, unmatchedABor, tolerance);

            if (match.Item1 != null)
            {
                var aborPrice = match.Item1;
                var isExactMatch = match.Item2;

                result.MatchedTransactions.Add(new MatchedItemInfo
                {
                    IBorEntityId = iborPrice.Id,
                    ABorEntityId = aborPrice.Id,
                    EntityType = "Price",
                    Date = iborPrice.Date,
                    Amount = iborPrice.Value,
                    IsExactMatch = isExactMatch,
                    Difference = Math.Abs(iborPrice.Value - aborPrice.Value)
                });

                unmatchedIBor.Remove(iborPrice);
                unmatchedABor.Remove(aborPrice);
                result.MatchedItems++;
            }
            else
            {
                // Check if there's a price difference for the same instrument/date
                var sameInstrumentPrice = aborPrices.FirstOrDefault(p =>
                    p.InstrumentId == iborPrice.InstrumentId &&
                    p.Date == iborPrice.Date);

                if (sameInstrumentPrice != null)
                {
                    var variance = Math.Abs(iborPrice.Value - sameInstrumentPrice.Value);
                    var percentageVariance = sameInstrumentPrice.Value != 0
                        ? variance / sameInstrumentPrice.Value * 100
                        : 0;

                    result.Breaks.Add(new ReconciliationBreakInfo
                    {
                        BreakId = Guid.NewGuid(),
                        BreakType = ReconciliationBreakType.PriceDifference,
                        EntityType = "Price",
                        Description = $"Price variance of {percentageVariance:N2}%",
                        ExpectedValue = $"Price: {iborPrice.Value:C}",
                        ActualValue = $"Price: {sameInstrumentPrice.Value:C}",
                        Variance = variance,
                        InstrumentId = iborPrice.InstrumentId,
                        BreakDate = iborPrice.Date
                    });
                    result.BreakCount++;
                }
            }
        }

        // Create breaks for unmatched items
        foreach (var iborPrice in unmatchedIBor)
        {
            result.UnmatchedIBorItems.Add(new UnmatchedItemInfo
            {
                EntityId = iborPrice.Id,
                Source = BookOfRecord.IBoR,
                EntityType = "Price",
                Date = iborPrice.Date,
                Amount = iborPrice.Value
            });
            result.BreakCount++;
        }

        foreach (var aborPrice in unmatchedABor)
        {
            result.UnmatchedABorItems.Add(new UnmatchedItemInfo
            {
                EntityId = aborPrice.Id,
                Source = BookOfRecord.ABoR,
                EntityType = "Price",
                Date = aborPrice.Date,
                Amount = aborPrice.Value
            });
            result.BreakCount++;
        }

        result.UnmatchedItems = unmatchedIBor.Count + unmatchedABor.Count;

        return result;
    }

    private (CashFlow?, bool) FindBestMatch(CashFlow iborTxn, List<CashFlow> aborTransactions, MatchingTolerance tolerance)
    {
        // Try exact match first
        var exactMatch = aborTransactions.FirstOrDefault(a =>
            a.AccountId == iborTxn.AccountId &&
            a.Date == iborTxn.Date &&
            a.Amount == iborTxn.Amount &&
            a.Type == iborTxn.Type);

        if (exactMatch != null)
            return (exactMatch, true);

        // Try tolerance-based match
        var toleranceMatch = aborTransactions.FirstOrDefault(a =>
            a.AccountId == iborTxn.AccountId &&
            tolerance.DatesMatch(a.Date, iborTxn.Date) &&
            tolerance.AmountsMatch(a.Amount, iborTxn.Amount) &&
            a.Type == iborTxn.Type);

        if (toleranceMatch != null)
            return (toleranceMatch, false);

        // No match found
        return (null, false);
    }

    private (Holding?, bool) FindBestHoldingMatch(Holding iborHolding, List<Holding> aborHoldings, MatchingTolerance tolerance)
    {
        // Try exact match first
        var exactMatch = aborHoldings.FirstOrDefault(a =>
            a.AccountId == iborHolding.AccountId &&
            a.InstrumentId == iborHolding.InstrumentId &&
            a.Date == iborHolding.Date &&
            a.Units == iborHolding.Units);

        if (exactMatch != null)
            return (exactMatch, true);

        // Try tolerance-based match
        var toleranceMatch = aborHoldings.FirstOrDefault(a =>
            a.AccountId == iborHolding.AccountId &&
            a.InstrumentId == iborHolding.InstrumentId &&
            tolerance.DatesMatch(a.Date, iborHolding.Date) &&
            tolerance.QuantitiesMatch(a.Units, iborHolding.Units));

        if (toleranceMatch != null)
            return (toleranceMatch, false);

        // No match found
        return (null, false);
    }

    private (Price?, bool) FindBestPriceMatch(Price iborPrice, List<Price> aborPrices, MatchingTolerance tolerance)
    {
        // Try exact match first
        var exactMatch = aborPrices.FirstOrDefault(a =>
            a.InstrumentId == iborPrice.InstrumentId &&
            a.Date == iborPrice.Date &&
            a.Value == iborPrice.Value);

        if (exactMatch != null)
            return (exactMatch, true);

        // Try tolerance-based match
        var toleranceMatch = aborPrices.FirstOrDefault(a =>
            a.InstrumentId == iborPrice.InstrumentId &&
            tolerance.DatesMatch(a.Date, iborPrice.Date) &&
            tolerance.PricesMatch(a.Value, iborPrice.Value));

        if (toleranceMatch != null)
            return (toleranceMatch, false);

        // No match found
        return (null, false);
    }
}
