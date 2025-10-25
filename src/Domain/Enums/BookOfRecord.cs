namespace Domain.Enums;

/// <summary>
///     Indicates which book of record the data belongs to in the ABoR/IBoR workflow
/// </summary>
public enum BookOfRecord
{
    /// <summary>
    ///     Investment Book of Record - raw data from external sources awaiting reconciliation
    /// </summary>
    IBoR = 1,

    /// <summary>
    ///     Accounting Book of Record - reconciled and approved data used for reporting
    /// </summary>
    ABoR = 2
}
