namespace Domain.Enums;

/// <summary>
///     Types of breaks that can occur during reconciliation
/// </summary>
public enum ReconciliationBreakType
{
    /// <summary>
    ///     Transaction exists in IBoR but not in ABoR (or vice versa)
    /// </summary>
    MissingTransaction = 1,

    /// <summary>
    ///     Position quantity doesn't match between IBoR and ABoR
    /// </summary>
    QuantityMismatch = 2,

    /// <summary>
    ///     Transaction amount differs between IBoR and ABoR
    /// </summary>
    AmountMismatch = 3,

    /// <summary>
    ///     Cash balance doesn't reconcile
    /// </summary>
    CashMismatch = 4,

    /// <summary>
    ///     Price differs significantly from expected source
    /// </summary>
    PriceDifference = 5,

    /// <summary>
    ///     Valuation difference exceeds tolerance
    /// </summary>
    ValuationMismatch = 6,

    /// <summary>
    ///     Instrument reference doesn't match or is unknown
    /// </summary>
    InstrumentMismatch = 7,

    /// <summary>
    ///     Data validation failed (e.g., negative units, invalid dates)
    /// </summary>
    ValidationError = 8,

    /// <summary>
    ///     Duplicate transaction detected
    /// </summary>
    Duplicate = 9,

    /// <summary>
    ///     Other unspecified reconciliation issue
    /// </summary>
    Other = 99
}
