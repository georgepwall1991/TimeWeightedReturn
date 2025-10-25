using System.Globalization;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

/// <summary>
///     Imports transactions from CSV files (custodian format)
/// </summary>
public class CsvTransactionImporter : ITransactionImporter
{
    private readonly PortfolioContext _context;

    public CsvTransactionImporter(PortfolioContext context)
    {
        _context = context;
    }

    public string ImporterName => "CSV Transaction Importer";
    public string[] SupportedExtensions => new[] { ".csv", ".txt" };

    public async Task<bool> CanProcessAsync(Stream fileStream, string fileName, CancellationToken cancellationToken = default)
    {
        if (!fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase) &&
            !fileName.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
            return false;

        try
        {
            using var reader = new StreamReader(fileStream, leaveOpen: true);
            var firstLine = await reader.ReadLineAsync(cancellationToken);
            fileStream.Position = 0; // Reset for actual processing

            // Check if header contains expected columns
            if (firstLine == null) return false;

            var hasTransactionColumns = firstLine.Contains("Date", StringComparison.OrdinalIgnoreCase) &&
                                       firstLine.Contains("Amount", StringComparison.OrdinalIgnoreCase);

            return hasTransactionColumns;
        }
        catch
        {
            return false;
        }
    }

    public async Task<ImportResult> ImportTransactionsAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default)
    {
        var result = new ImportResult();
        var transactions = new List<CashFlow>();
        var errors = new List<string>();

        try
        {
            // Create batch
            var batch = new ReconciliationBatch
            {
                Id = Guid.NewGuid(),
                BatchDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Source = ImporterName,
                SourceFileName = fileName,
                Status = ReconciliationStatus.Pending,
                SubmittedBy = submittedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ReconciliationBatches.Add(batch);

            using var reader = new StreamReader(fileStream);
            var headerLine = await reader.ReadLineAsync(cancellationToken);
            if (headerLine == null)
            {
                result.Errors.Add("File is empty");
                return result;
            }

            var headers = ParseCsvLine(headerLine);
            var columnMap = MapColumns(headers);

            var lineNumber = 1;
            while (!reader.EndOfStream)
            {
                lineNumber++;
                var line = await reader.ReadLineAsync(cancellationToken);
                if (string.IsNullOrWhiteSpace(line)) continue;

                result.RecordsProcessed++;

                try
                {
                    var values = ParseCsvLine(line);
                    var transaction = ParseTransaction(values, columnMap, batch.Id, submittedBy);

                    if (transaction != null)
                    {
                        transactions.Add(transaction);
                        result.RecordsImported++;
                    }
                }
                catch (Exception ex)
                {
                    var error = $"Line {lineNumber}: {ex.Message}";
                    errors.Add(error);
                    result.RecordsFailed++;
                }
            }

            // Save transactions
            _context.CashFlows.AddRange(transactions);

            // Update batch counts
            batch.ItemCount = transactions.Count;
            batch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            result.Success = true;
            result.BatchId = batch.Id;
            result.Errors = errors;

            return result;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Errors.Add($"Import failed: {ex.Message}");
            return result;
        }
    }

    public async Task<ImportResult> ImportHoldingsAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default)
    {
        var result = new ImportResult();
        var holdings = new List<Holding>();
        var errors = new List<string>();

        try
        {
            // Create batch
            var batch = new ReconciliationBatch
            {
                Id = Guid.NewGuid(),
                BatchDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Source = ImporterName,
                SourceFileName = fileName,
                Status = ReconciliationStatus.Pending,
                SubmittedBy = submittedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ReconciliationBatches.Add(batch);

            using var reader = new StreamReader(fileStream);
            var headerLine = await reader.ReadLineAsync(cancellationToken);
            if (headerLine == null)
            {
                result.Errors.Add("File is empty");
                return result;
            }

            var headers = ParseCsvLine(headerLine);
            var columnMap = MapColumns(headers);

            var lineNumber = 1;
            while (!reader.EndOfStream)
            {
                lineNumber++;
                var line = await reader.ReadLineAsync(cancellationToken);
                if (string.IsNullOrWhiteSpace(line)) continue;

                result.RecordsProcessed++;

                try
                {
                    var values = ParseCsvLine(line);
                    var holding = await ParseHoldingAsync(values, columnMap, batch.Id, submittedBy, cancellationToken);

                    if (holding != null)
                    {
                        holdings.Add(holding);
                        result.RecordsImported++;
                    }
                }
                catch (Exception ex)
                {
                    var error = $"Line {lineNumber}: {ex.Message}";
                    errors.Add(error);
                    result.RecordsFailed++;
                }
            }

            // Save holdings
            _context.Holdings.AddRange(holdings);

            // Update batch counts
            batch.ItemCount = holdings.Count;
            batch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            result.Success = true;
            result.BatchId = batch.Id;
            result.Errors = errors;

            return result;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Errors.Add($"Import failed: {ex.Message}");
            return result;
        }
    }

    public async Task<ImportResult> ImportPricesAsync(
        Stream fileStream,
        string fileName,
        string submittedBy,
        CancellationToken cancellationToken = default)
    {
        var result = new ImportResult();
        var prices = new List<Price>();
        var errors = new List<string>();

        try
        {
            // Create batch
            var batch = new ReconciliationBatch
            {
                Id = Guid.NewGuid(),
                BatchDate = DateOnly.FromDateTime(DateTime.UtcNow),
                Source = ImporterName,
                SourceFileName = fileName,
                Status = ReconciliationStatus.Pending,
                SubmittedBy = submittedBy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ReconciliationBatches.Add(batch);

            using var reader = new StreamReader(fileStream);
            var headerLine = await reader.ReadLineAsync(cancellationToken);
            if (headerLine == null)
            {
                result.Errors.Add("File is empty");
                return result;
            }

            var headers = ParseCsvLine(headerLine);
            var columnMap = MapColumns(headers);

            var lineNumber = 1;
            while (!reader.EndOfStream)
            {
                lineNumber++;
                var line = await reader.ReadLineAsync(cancellationToken);
                if (string.IsNullOrWhiteSpace(line)) continue;

                result.RecordsProcessed++;

                try
                {
                    var values = ParseCsvLine(line);
                    var price = await ParsePriceAsync(values, columnMap, batch.Id, submittedBy, cancellationToken);

                    if (price != null)
                    {
                        prices.Add(price);
                        result.RecordsImported++;
                    }
                }
                catch (Exception ex)
                {
                    var error = $"Line {lineNumber}: {ex.Message}";
                    errors.Add(error);
                    result.RecordsFailed++;
                }
            }

            // Save prices
            _context.Prices.AddRange(prices);

            // Update batch counts
            batch.ItemCount = prices.Count;
            batch.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            result.Success = true;
            result.BatchId = batch.Id;
            result.Errors = errors;

            return result;
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Errors.Add($"Import failed: {ex.Message}");
            return result;
        }
    }

    private string[] ParseCsvLine(string line)
    {
        // Simple CSV parser (handles quoted fields)
        var fields = new List<string>();
        var inQuotes = false;
        var currentField = string.Empty;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];

            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                fields.Add(currentField.Trim());
                currentField = string.Empty;
            }
            else
            {
                currentField += c;
            }
        }

        fields.Add(currentField.Trim());
        return fields.ToArray();
    }

    private Dictionary<string, int> MapColumns(string[] headers)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        for (var i = 0; i < headers.Length; i++)
        {
            var header = headers[i].Trim();
            map[header] = i;

            // Add common aliases
            if (header.Equals("Account Number", StringComparison.OrdinalIgnoreCase) ||
                header.Equals("AccountNumber", StringComparison.OrdinalIgnoreCase))
                map["Account"] = i;

            if (header.Equals("Transaction Date", StringComparison.OrdinalIgnoreCase) ||
                header.Equals("TransactionDate", StringComparison.OrdinalIgnoreCase))
                map["Date"] = i;

            if (header.Equals("Symbol", StringComparison.OrdinalIgnoreCase) ||
                header.Equals("Security", StringComparison.OrdinalIgnoreCase))
                map["Ticker"] = i;
        }

        return map;
    }

    private CashFlow? ParseTransaction(string[] values, Dictionary<string, int> columnMap, Guid batchId, string submittedBy)
    {
        // Required fields
        if (!TryGetValue(values, columnMap, "Account", out var accountNumber)) return null;
        if (!TryGetValue(values, columnMap, "Date", out var dateStr)) return null;
        if (!TryGetValue(values, columnMap, "Amount", out var amountStr)) return null;

        // Parse date
        if (!DateOnly.TryParse(dateStr, out var date))
            throw new FormatException($"Invalid date format: {dateStr}");

        // Parse amount
        if (!decimal.TryParse(amountStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount))
            throw new FormatException($"Invalid amount format: {amountStr}");

        // Find account
        var account = _context.Accounts.FirstOrDefault(a => a.AccountNumber == accountNumber);
        if (account == null)
            throw new InvalidOperationException($"Account not found: {accountNumber}");

        // Parse transaction type
        TryGetValue(values, columnMap, "Type", out var typeStr);
        TryGetValue(values, columnMap, "Description", out var description);

        var type = ParseTransactionType(typeStr ?? description ?? "Unknown");
        var category = GetCashFlowCategory(type);

        return new CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Date = date,
            Amount = amount,
            Description = description ?? typeStr ?? "Imported transaction",
            Type = type,
            Category = category,
            BookOfRecord = BookOfRecord.IBoR,
            Status = ReconciliationStatus.Pending,
            BatchId = batchId,
            SubmittedBy = submittedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private async Task<Holding?> ParseHoldingAsync(string[] values, Dictionary<string, int> columnMap, Guid batchId, string submittedBy, CancellationToken cancellationToken)
    {
        // Required fields
        if (!TryGetValue(values, columnMap, "Account", out var accountNumber)) return null;
        if (!TryGetValue(values, columnMap, "Date", out var dateStr)) return null;
        if (!TryGetValue(values, columnMap, "Ticker", out var ticker)) return null;
        if (!TryGetValue(values, columnMap, "Units", out var unitsStr)) return null;

        // Parse date
        if (!DateOnly.TryParse(dateStr, out var date))
            throw new FormatException($"Invalid date format: {dateStr}");

        // Parse units
        if (!decimal.TryParse(unitsStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var units))
            throw new FormatException($"Invalid units format: {unitsStr}");

        // Find account
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.AccountNumber == accountNumber, cancellationToken);
        if (account == null)
            throw new InvalidOperationException($"Account not found: {accountNumber}");

        // Find instrument
        var instrument = await _context.Instruments.FirstOrDefaultAsync(i => i.Ticker == ticker, cancellationToken);
        if (instrument == null)
            throw new InvalidOperationException($"Instrument not found: {ticker}");

        return new Holding
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            InstrumentId = instrument.Id,
            Date = date,
            Units = units,
            BookOfRecord = BookOfRecord.IBoR,
            Status = ReconciliationStatus.Pending,
            BatchId = batchId,
            SubmittedBy = submittedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private async Task<Price?> ParsePriceAsync(string[] values, Dictionary<string, int> columnMap, Guid batchId, string submittedBy, CancellationToken cancellationToken)
    {
        // Required fields
        if (!TryGetValue(values, columnMap, "Ticker", out var ticker)) return null;
        if (!TryGetValue(values, columnMap, "Date", out var dateStr)) return null;
        if (!TryGetValue(values, columnMap, "Price", out var priceStr)) return null;

        // Parse date
        if (!DateOnly.TryParse(dateStr, out var date))
            throw new FormatException($"Invalid date format: {dateStr}");

        // Parse price
        if (!decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var price))
            throw new FormatException($"Invalid price format: {priceStr}");

        // Find instrument
        var instrument = await _context.Instruments.FirstOrDefaultAsync(i => i.Ticker == ticker, cancellationToken);
        if (instrument == null)
            throw new InvalidOperationException($"Instrument not found: {ticker}");

        return new Price
        {
            Id = Guid.NewGuid(),
            InstrumentId = instrument.Id,
            Date = date,
            Value = price,
            Source = PriceSource.Manual,
            BookOfRecord = BookOfRecord.IBoR,
            Status = ReconciliationStatus.Pending,
            BatchId = batchId,
            SubmittedBy = submittedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private bool TryGetValue(string[] values, Dictionary<string, int> columnMap, string columnName, out string value)
    {
        value = string.Empty;
        if (!columnMap.TryGetValue(columnName, out var index)) return false;
        if (index >= values.Length) return false;

        value = values[index];
        return !string.IsNullOrWhiteSpace(value);
    }

    private CashFlowType ParseTransactionType(string typeDescription)
    {
        var lower = typeDescription.ToLower();

        if (lower.Contains("dividend")) return CashFlowType.Dividend;
        if (lower.Contains("interest")) return CashFlowType.InterestEarned;
        if (lower.Contains("fee") || lower.Contains("management")) return CashFlowType.ManagementFee;
        if (lower.Contains("contribution") || lower.Contains("deposit")) return CashFlowType.ClientContribution;
        if (lower.Contains("withdrawal") || lower.Contains("distribution")) return CashFlowType.ClientWithdrawal;
        if (lower.Contains("buy") || lower.Contains("purchase")) return CashFlowType.RealizedGainLoss;
        if (lower.Contains("sell") || lower.Contains("sale")) return CashFlowType.RealizedGainLoss;
        if (lower.Contains("tax")) return CashFlowType.TaxWithholding;

        return CashFlowType.ClientContribution; // Default fallback
    }

    private CashFlowCategory GetCashFlowCategory(CashFlowType type)
    {
        return type switch
        {
            CashFlowType.Dividend => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.DividendReinvested => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.BondCoupon => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.InterestEarned => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.RealizedGainLoss => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.ManagementFee => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.CustodyFee => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TransactionCost => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TaxWithholding => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TaxReclaim => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.ForeignExchangeGainLoss => CashFlowCategory.PerformanceInfluencing,

            CashFlowType.ClientContribution => CashFlowCategory.ExternalFlow,
            CashFlowType.ClientWithdrawal => CashFlowCategory.ExternalFlow,
            CashFlowType.IncomeDistribution => CashFlowCategory.ExternalFlow,
            CashFlowType.TransferIn => CashFlowCategory.ExternalFlow,
            CashFlowType.TransferOut => CashFlowCategory.ExternalFlow,
            CashFlowType.ReturnOfCapital => CashFlowCategory.ExternalFlow,
            CashFlowType.CapitalCall => CashFlowCategory.ExternalFlow,
            CashFlowType.PerformanceFeePayment => CashFlowCategory.ExternalFlow,
            CashFlowType.EstimatedTaxPayment => CashFlowCategory.ExternalFlow,

            _ => CashFlowCategory.Internal
        };
    }
}
