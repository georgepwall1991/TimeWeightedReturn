using Domain.Entities;

namespace Application.Interfaces;

/// <summary>
///     Interface for importing transactions from various sources
/// </summary>
public interface ITransactionImporter
{
    /// <summary>
    ///     Name of the importer (e.g., "Custodian CSV", "Broker Excel")
    /// </summary>
    string ImporterName { get; }

    /// <summary>
    ///     Supported file extensions (e.g., ".csv", ".xlsx")
    /// </summary>
    string[] SupportedExtensions { get; }

    /// <summary>
    ///     Validates if the file can be processed by this importer
    /// </summary>
    Task<bool> CanProcessAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Imports transactions from a file
    /// </summary>
    Task<ImportResult> ImportTransactionsAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Imports holdings/positions from a file
    /// </summary>
    Task<ImportResult> ImportHoldingsAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    ///     Imports prices from a file
    /// </summary>
    Task<ImportResult> ImportPricesAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default);
}

/// <summary>
///     Result of an import operation
/// </summary>
public class ImportResult
{
    public bool Success { get; set; }
    public Guid? BatchId { get; set; }
    public int RecordsProcessed { get; set; }
    public int RecordsImported { get; set; }
    public int RecordsFailed { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}
