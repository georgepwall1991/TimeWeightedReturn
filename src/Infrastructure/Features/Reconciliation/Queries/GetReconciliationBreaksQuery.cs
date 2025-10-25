using Domain.Enums;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Reconciliation.Queries;

public record GetReconciliationBreaksQuery(
    Guid? BatchId = null,
    ReconciliationStatus? Status = null,
    ReconciliationBreakType? BreakType = null
) : IRequest<List<ReconciliationBreakDto>>;

public record ReconciliationBreakDto(
    Guid Id,
    Guid BatchId,
    ReconciliationBreakType BreakType,
    string EntityType,
    string Description,
    string? ExpectedValue,
    string? ActualValue,
    decimal? Variance,
    ReconciliationStatus Status,
    DateOnly? BreakDate,
    string? ResolvedBy,
    DateTime? ResolvedAt,
    DateTime CreatedAt
);

public class GetReconciliationBreaksQueryHandler : IRequestHandler<GetReconciliationBreaksQuery, List<ReconciliationBreakDto>>
{
    private readonly PortfolioContext _context;

    public GetReconciliationBreaksQueryHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<List<ReconciliationBreakDto>> Handle(GetReconciliationBreaksQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ReconciliationBreaks.AsQueryable();

        if (request.BatchId.HasValue)
            query = query.Where(b => b.BatchId == request.BatchId.Value);

        if (request.Status.HasValue)
            query = query.Where(b => b.Status == request.Status.Value);

        if (request.BreakType.HasValue)
            query = query.Where(b => b.BreakType == request.BreakType.Value);

        var breaks = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new ReconciliationBreakDto(
                b.Id,
                b.BatchId,
                b.BreakType,
                b.EntityType,
                b.Description,
                b.ExpectedValue,
                b.ActualValue,
                b.Variance,
                b.Status,
                b.BreakDate,
                b.ResolvedBy,
                b.ResolvedAt,
                b.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return breaks;
    }
}
