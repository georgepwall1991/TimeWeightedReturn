using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Reconciliation.Queries;

public record GetReconciliationBatchesQuery(
    DateOnly? FromDate = null,
    DateOnly? ToDate = null,
    ReconciliationStatus? Status = null
) : IRequest<List<ReconciliationBatchDto>>;

public record ReconciliationBatchDto(
    Guid Id,
    DateOnly BatchDate,
    string Source,
    string? SourceFileName,
    ReconciliationStatus Status,
    int ItemCount,
    int MatchedCount,
    int BreakCount,
    string? SubmittedBy,
    string? ApprovedBy,
    DateTime? ApprovedAt,
    DateTime CreatedAt
);

public class GetReconciliationBatchesQueryHandler : IRequestHandler<GetReconciliationBatchesQuery, List<ReconciliationBatchDto>>
{
    private readonly PortfolioContext _context;

    public GetReconciliationBatchesQueryHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<List<ReconciliationBatchDto>> Handle(GetReconciliationBatchesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ReconciliationBatches.AsQueryable();

        if (request.FromDate.HasValue)
            query = query.Where(b => b.BatchDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(b => b.BatchDate <= request.ToDate.Value);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status.Value);

        var batches = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new ReconciliationBatchDto(
                b.Id,
                b.BatchDate,
                b.Source,
                b.SourceFileName,
                b.Status,
                b.ItemCount,
                b.MatchedCount,
                b.BreakCount,
                b.SubmittedBy,
                b.ApprovedBy,
                b.ApprovedAt,
                b.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return batches;
    }
}
