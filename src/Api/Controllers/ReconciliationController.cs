using Application.Features.Reconciliation.Commands;
using Infrastructure.Features.Reconciliation.Queries;
using Domain.Enums;
using Domain.ValueObjects;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequirePortfolioManagerRole")]
public class ReconciliationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ReconciliationController> _logger;

    public ReconciliationController(IMediator mediator, ILogger<ReconciliationController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Download CSV template for import
    /// </summary>
    [HttpGet("templates/{templateType}")]
    [AllowAnonymous]
    public IActionResult DownloadTemplate(string templateType)
    {
        var csv = templateType.ToLower() switch
        {
            "transactions" => GenerateTransactionTemplate(),
            "holdings" => GenerateHoldingTemplate(),
            "prices" => GeneratePriceTemplate(),
            _ => null
        };

        if (csv == null)
            return BadRequest("Invalid template type. Use: transactions, holdings, or prices");

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"{templateType}_template.csv");
    }

    /// <summary>
    /// Export batches to CSV
    /// </summary>
    [HttpGet("batches/export")]
    public async Task<IActionResult> ExportBatches(
        [FromQuery] string? fromDate = null,
        [FromQuery] string? toDate = null,
        [FromQuery] ReconciliationStatus? status = null)
    {
        DateOnly? parsedFromDate = null;
        DateOnly? parsedToDate = null;

        if (!string.IsNullOrEmpty(fromDate) && DateOnly.TryParse(fromDate, out var fd))
            parsedFromDate = fd;

        if (!string.IsNullOrEmpty(toDate) && DateOnly.TryParse(toDate, out var td))
            parsedToDate = td;

        var query = new GetReconciliationBatchesQuery(parsedFromDate, parsedToDate, status);
        var batches = await _mediator.Send(query);

        var csv = GenerateBatchesCsv(batches);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"batches_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
    }

    /// <summary>
    /// Export breaks to CSV
    /// </summary>
    [HttpGet("breaks/export")]
    public async Task<IActionResult> ExportBreaks(
        [FromQuery] Guid? batchId = null,
        [FromQuery] ReconciliationStatus? status = null,
        [FromQuery] ReconciliationBreakType? breakType = null)
    {
        var query = new GetReconciliationBreaksQuery(batchId, status, breakType);
        var breaks = await _mediator.Send(query);

        var csv = GenerateBreaksCsv(breaks);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"breaks_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
    }

    /// <summary>
    /// Import transactions/holdings/prices from file
    /// </summary>
    [HttpPost("import")]
    public async Task<IActionResult> ImportFile(
        [FromForm] IFormFile file,
        [FromForm] string importType, // "Transactions", "Holdings", "Prices"
        [FromForm] string submittedBy)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file provided");

        using var stream = file.OpenReadStream();
        var command = new ImportTransactionsCommand(stream, file.FileName, importType, submittedBy);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { result.Errors, result.Warnings });

        return Ok(result);
    }

    /// <summary>
    /// Run reconciliation for a batch
    /// </summary>
    [HttpPost("run")]
    public async Task<IActionResult> RunReconciliation(
        [FromBody] RunReconciliationRequest request)
    {
        var command = new RunReconciliationCommand(
            request.BatchId,
            request.ReconciliationDate,
            request.ReconciliationType,
            request.UseTolerance == "strict" ? MatchingTolerance.Strict :
            request.UseTolerance == "relaxed" ? MatchingTolerance.Relaxed :
            MatchingTolerance.Standard
        );

        var result = await _mediator.Send(command);

        _logger.LogInformation(
            "Reconciliation completed for batch {BatchId}. Matched: {Matched}, Breaks: {Breaks}",
            request.BatchId, result.MatchedItems, result.BreakCount);

        return Ok(result);
    }

    /// <summary>
    /// Get reconciliation batches
    /// </summary>
    [HttpGet("batches")]
    public async Task<IActionResult> GetBatches(
        [FromQuery] string? fromDate = null,
        [FromQuery] string? toDate = null,
        [FromQuery] ReconciliationStatus? status = null)
    {
        DateOnly? parsedFromDate = null;
        DateOnly? parsedToDate = null;

        if (!string.IsNullOrEmpty(fromDate) && DateOnly.TryParse(fromDate, out var fd))
            parsedFromDate = fd;

        if (!string.IsNullOrEmpty(toDate) && DateOnly.TryParse(toDate, out var td))
            parsedToDate = td;

        var query = new GetReconciliationBatchesQuery(parsedFromDate, parsedToDate, status);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get reconciliation breaks
    /// </summary>
    [HttpGet("breaks")]
    public async Task<IActionResult> GetBreaks(
        [FromQuery] Guid? batchId = null,
        [FromQuery] ReconciliationStatus? status = null,
        [FromQuery] ReconciliationBreakType? breakType = null)
    {
        var query = new GetReconciliationBreaksQuery(batchId, status, breakType);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Approve a reconciliation batch
    /// </summary>
    [HttpPost("batches/{batchId}/approve")]
    public async Task<IActionResult> ApproveBatch(
        Guid batchId,
        [FromBody] ApproveRejectRequest request)
    {
        var command = new ApproveReconciliationBatchCommand(batchId, request.ApprovedBy, request.Comments);
        await _mediator.Send(command);

        _logger.LogInformation("Batch {BatchId} approved by {User}", batchId, request.ApprovedBy);

        return Ok(new { Message = "Batch approved successfully" });
    }

    /// <summary>
    /// Reject a reconciliation batch
    /// </summary>
    [HttpPost("batches/{batchId}/reject")]
    public async Task<IActionResult> RejectBatch(
        Guid batchId,
        [FromBody] ApproveRejectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Comments))
            return BadRequest("Reason is required when rejecting a batch");

        var command = new RejectReconciliationBatchCommand(batchId, request.ApprovedBy, request.Comments!);
        await _mediator.Send(command);

        _logger.LogInformation("Batch {BatchId} rejected by {User}", batchId, request.ApprovedBy);

        return Ok(new { Message = "Batch rejected successfully" });
    }

    /// <summary>
    /// Resolve a reconciliation break
    /// </summary>
    [HttpPost("breaks/{breakId}/resolve")]
    public async Task<IActionResult> ResolveBreak(
        Guid breakId,
        [FromBody] ResolveBreakRequest request)
    {
        var command = new ResolveBreakCommand(
            breakId,
            request.ResolvedBy,
            request.ResolutionAction,
            request.Comments);

        await _mediator.Send(command);

        _logger.LogInformation("Break {BreakId} resolved by {User}: {Action}",
            breakId, request.ResolvedBy, request.ResolutionAction);

        return Ok(new { Message = "Break resolved successfully" });
    }

    /// <summary>
    /// Get reconciliation dashboard statistics
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        // Get summary statistics
        var allBatches = await _mediator.Send(new GetReconciliationBatchesQuery());
        var unresolvedBreaks = await _mediator.Send(
            new GetReconciliationBreaksQuery(null, ReconciliationStatus.Break, null));

        var dashboard = new
        {
            TotalBatches = allBatches.Count,
            PendingBatches = allBatches.Count(b => b.Status == ReconciliationStatus.Pending),
            ApprovedBatches = allBatches.Count(b => b.Status == ReconciliationStatus.Approved),
            UnresolvedBreaks = unresolvedBreaks.Count,
            BreaksByType = unresolvedBreaks
                .GroupBy(b => b.BreakType)
                .Select(g => new { BreakType = g.Key.ToString(), Count = g.Count() })
                .ToList(),
            RecentBatches = allBatches.Take(10).ToList()
        };

        return Ok(dashboard);
    }

    private static string GenerateTransactionTemplate()
    {
        return @"AccountCode,Date,Type,InstrumentCode,Quantity,Price,Amount,Currency,Description
ACC001,2025-01-15,Buy,AAPL,100,150.50,15050.00,USD,Purchase Apple shares
ACC001,2025-01-16,Sell,MSFT,50,350.25,17512.50,USD,Sell Microsoft shares
ACC002,2025-01-17,Dividend,GOOGL,0,0,250.00,USD,Quarterly dividend payment";
    }

    private static string GenerateHoldingTemplate()
    {
        return @"AccountCode,Date,InstrumentCode,Quantity,AverageCost,MarketValue,Currency
ACC001,2025-01-31,AAPL,100,150.50,15500.00,USD
ACC001,2025-01-31,MSFT,200,340.00,70000.00,USD
ACC002,2025-01-31,GOOGL,75,145.00,11250.00,USD";
    }

    private static string GeneratePriceTemplate()
    {
        return @"InstrumentCode,Date,Price,Currency
AAPL,2025-01-31,155.00,USD
MSFT,2025-01-31,350.00,USD
GOOGL,2025-01-31,150.00,USD
TSLA,2025-01-31,245.50,USD";
    }

    private static string GenerateBatchesCsv(List<Infrastructure.Features.Reconciliation.Queries.ReconciliationBatchDto> batches)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("BatchId,BatchDate,Source,FileName,Status,ItemCount,MatchedCount,BreakCount,SubmittedBy,CreatedAt,ApprovedBy,ApprovedAt");

        foreach (var batch in batches)
        {
            sb.AppendLine($"{batch.Id},{batch.BatchDate},{batch.Source},{EscapeCsv(batch.SourceFileName)},{batch.Status},{batch.ItemCount},{batch.MatchedCount},{batch.BreakCount},{EscapeCsv(batch.SubmittedBy)},{batch.CreatedAt:yyyy-MM-dd HH:mm:ss},{EscapeCsv(batch.ApprovedBy)},{batch.ApprovedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return sb.ToString();
    }

    private static string GenerateBreaksCsv(List<Infrastructure.Features.Reconciliation.Queries.ReconciliationBreakDto> breaks)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("BreakId,BatchId,BreakType,EntityType,Description,ExpectedValue,ActualValue,Variance,BreakDate,Status,ResolvedBy,ResolvedAt,CreatedAt");

        foreach (var breakItem in breaks)
        {
            sb.AppendLine($"{breakItem.Id},{breakItem.BatchId},{breakItem.BreakType},{EscapeCsv(breakItem.EntityType)},{EscapeCsv(breakItem.Description)},{EscapeCsv(breakItem.ExpectedValue)},{EscapeCsv(breakItem.ActualValue)},{breakItem.Variance},{breakItem.BreakDate},{breakItem.Status},{EscapeCsv(breakItem.ResolvedBy)},{breakItem.ResolvedAt:yyyy-MM-dd HH:mm:ss},{breakItem.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return sb.ToString();
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return "\"" + value.Replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

public record RunReconciliationRequest(
    Guid BatchId,
    DateOnly ReconciliationDate,
    string ReconciliationType,
    string UseTolerance = "standard"
);

public record ApproveRejectRequest(
    string ApprovedBy,
    string? Comments = null
);

public record ResolveBreakRequest(
    string ResolvedBy,
    string ResolutionAction,
    string? Comments = null
);
