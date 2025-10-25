using Application.Interfaces;
using MediatR;

namespace Application.Features.Reconciliation.Commands;

public record ImportTransactionsCommand(
    Stream FileStream,
    string FileName,
    string ImportType, // "Transactions", "Holdings", "Prices"
    string SubmittedBy
) : IRequest<ImportTransactionsResponse>;

public record ImportTransactionsResponse(
    bool Success,
    Guid? BatchId,
    int RecordsProcessed,
    int RecordsImported,
    int RecordsFailed,
    List<string> Errors,
    List<string> Warnings
);

public class ImportTransactionsCommandHandler : IRequestHandler<ImportTransactionsCommand, ImportTransactionsResponse>
{
    private readonly ITransactionImporter _importer;

    public ImportTransactionsCommandHandler(ITransactionImporter importer)
    {
        _importer = importer;
    }

    public async Task<ImportTransactionsResponse> Handle(ImportTransactionsCommand request, CancellationToken cancellationToken)
    {
        // Validate file can be processed
        var canProcess = await _importer.CanProcessAsync(request.FileStream, request.FileName, cancellationToken);
        if (!canProcess)
        {
            return new ImportTransactionsResponse(
                false,
                null,
                0,
                0,
                0,
                new List<string> { "File format not supported or invalid" },
                new List<string>()
            );
        }

        request.FileStream.Position = 0; // Reset stream

        // Import based on type
        ImportResult result = request.ImportType.ToLower() switch
        {
            "transactions" => await _importer.ImportTransactionsAsync(request.FileStream, request.FileName, request.SubmittedBy, cancellationToken),
            "holdings" => await _importer.ImportHoldingsAsync(request.FileStream, request.FileName, request.SubmittedBy, cancellationToken),
            "prices" => await _importer.ImportPricesAsync(request.FileStream, request.FileName, request.SubmittedBy, cancellationToken),
            _ => throw new ArgumentException($"Invalid import type: {request.ImportType}")
        };

        return new ImportTransactionsResponse(
            result.Success,
            result.BatchId,
            result.RecordsProcessed,
            result.RecordsImported,
            result.RecordsFailed,
            result.Errors,
            result.Warnings
        );
    }
}
