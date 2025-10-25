using Domain.Entities;
using Domain.Enums;

namespace Application.DTOs;

public record TransactionDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public DateOnly Date { get; init; }
    public decimal Amount { get; init; }
    public string Description { get; init; } = string.Empty;
    public CashFlowType Type { get; init; }
    public CashFlowCategory Category { get; init; }
    public string? TransactionReference { get; init; }
    public BookOfRecord BookOfRecord { get; init; }
    public ReconciliationStatus Status { get; init; }
    public Guid? BatchId { get; init; }
    public string? SubmittedBy { get; init; }
    public string? ApprovedBy { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    public static TransactionDto FromCashFlow(CashFlow cashFlow)
    {
        return new TransactionDto
        {
            Id = cashFlow.Id,
            AccountId = cashFlow.AccountId,
            Date = cashFlow.Date,
            Amount = cashFlow.Amount,
            Description = cashFlow.Description,
            Type = cashFlow.Type,
            Category = cashFlow.Category,
            TransactionReference = cashFlow.TransactionReference,
            BookOfRecord = cashFlow.BookOfRecord,
            Status = cashFlow.Status,
            BatchId = cashFlow.BatchId,
            SubmittedBy = cashFlow.SubmittedBy,
            ApprovedBy = cashFlow.ApprovedBy,
            ApprovedAt = cashFlow.ApprovedAt,
            CreatedAt = cashFlow.CreatedAt,
            UpdatedAt = cashFlow.UpdatedAt
        };
    }
}

public record CreateTransactionRequest
{
    public Guid AccountId { get; init; }
    public DateOnly Date { get; init; }
    public decimal Amount { get; init; }
    public string Description { get; init; } = string.Empty;
    public CashFlowType Type { get; init; }
    public string? TransactionReference { get; init; }
}

public record UpdateTransactionRequest
{
    public DateOnly Date { get; init; }
    public decimal Amount { get; init; }
    public string Description { get; init; } = string.Empty;
    public CashFlowType Type { get; init; }
    public string? TransactionReference { get; init; }
}

public record TransactionFilters
{
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public List<CashFlowType>? Types { get; init; }
    public List<CashFlowCategory>? Categories { get; init; }
    public ReconciliationStatus? Status { get; init; }
}
