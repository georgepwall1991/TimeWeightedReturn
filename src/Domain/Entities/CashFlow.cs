using Domain.Enums;

namespace Domain.Entities;

public class CashFlow
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public DateOnly Date { get; set; }
    public decimal Amount { get; set; } // Positive = inflow, Negative = outflow
    public string Description { get; set; } = string.Empty;
    public CashFlowType Type { get; set; }
    public CashFlowCategory Category { get; set; }
    public string? TransactionReference { get; set; }

    // ABoR/IBoR Workflow fields
    public BookOfRecord BookOfRecord { get; set; } = BookOfRecord.ABoR; // Default to ABoR for existing data
    public ReconciliationStatus Status { get; set; } = ReconciliationStatus.Approved; // Default to approved for existing data
    public Guid? BatchId { get; set; } // Link to reconciliation batch if imported
    public string? SubmittedBy { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Account Account { get; set; } = null!;
    public virtual ReconciliationBatch? Batch { get; set; }
}

/// <summary>
///     Cash flow types for portfolio management
/// </summary>
public enum CashFlowType
{
    // Performance-Influencing (keep in TWR calculation)
    Dividend = 1, // Cash dividends received
    DividendReinvested = 2, // Dividends automatically reinvested
    BondCoupon = 3, // Bond coupon payments
    InterestEarned = 4, // Interest on cash holdings
    RealizedGainLoss = 5, // Proceeds from security sales
    ManagementFee = 6, // Management fees (for net-of-fee TWR)
    CustodyFee = 7, // Custody fees
    TransactionCost = 8, // Brokerage commissions, bid-offer spread
    TaxWithholding = 9, // Dividend withholding tax
    TaxReclaim = 10, // Tax reclaims credited to portfolio
    ForeignExchangeGainLoss = 11, // FX revaluation adjustments

    // Non-Performance-Influencing (external flows - break TWR periods)
    ClientContribution = 20, // Client deposits cash
    ClientWithdrawal = 21, // Client withdrawals
    IncomeDistribution = 22, // Income paid out to client
    TransferIn = 23, // Securities/cash transferred in
    TransferOut = 24, // Securities/cash transferred out
    ReturnOfCapital = 25, // REIT/MLP return of capital
    CapitalCall = 26, // Private equity capital calls
    PerformanceFeePayment = 27, // Performance fees paid to external party
    EstimatedTaxPayment = 28, // Tax payments made on behalf of client

    // Internal Movements (no impact on TWR)
    InternalTransfer = 30, // Between sleeves in same portfolio
    CashSweep = 31, // Automatic cash management
    SettlementAdjustment = 32, // Trade settlement corrections
    AccruedInterestAdjustment = 33 // Bond accrued interest adjustments
}

/// <summary>
///     Category for TWR calculation treatment
/// </summary>
public enum CashFlowCategory
{
    /// <summary>
    ///     Performance-influencing: Keep in TWR calculation numerator
    ///     These represent returns earned by the portfolio assets
    /// </summary>
    PerformanceInfluencing = 1,

    /// <summary>
    ///     External flow: Strip out and break TWR sub-periods
    ///     These represent client-driven capital flows
    /// </summary>
    ExternalFlow = 2,

    /// <summary>
    ///     Internal movement: No impact on portfolio TWR
    ///     These are accounting adjustments or internal transfers
    /// </summary>
    Internal = 3
}
