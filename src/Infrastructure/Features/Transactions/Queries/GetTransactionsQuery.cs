using Application.DTOs;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Transactions.Queries;

public record GetTransactionsQuery(Guid AccountId, TransactionFilters? Filters = null) : IRequest<List<TransactionDto>>;

public class GetTransactionsQueryHandler : IRequestHandler<GetTransactionsQuery, List<TransactionDto>>
{
    private readonly PortfolioContext _context;

    public GetTransactionsQueryHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<List<TransactionDto>> Handle(GetTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CashFlows
            .Where(cf => cf.AccountId == request.AccountId);

        // Apply filters if provided
        if (request.Filters != null)
        {
            if (request.Filters.StartDate.HasValue)
                query = query.Where(cf => cf.Date >= request.Filters.StartDate.Value);

            if (request.Filters.EndDate.HasValue)
                query = query.Where(cf => cf.Date <= request.Filters.EndDate.Value);

            if (request.Filters.Types != null && request.Filters.Types.Count > 0)
                query = query.Where(cf => request.Filters.Types.Contains(cf.Type));

            if (request.Filters.Categories != null && request.Filters.Categories.Count > 0)
                query = query.Where(cf => request.Filters.Categories.Contains(cf.Category));

            if (request.Filters.Status.HasValue)
                query = query.Where(cf => cf.Status == request.Filters.Status.Value);
        }

        var cashFlows = await query
            .OrderByDescending(cf => cf.Date)
            .ThenByDescending(cf => cf.CreatedAt)
            .ToListAsync(cancellationToken);

        return cashFlows.Select(TransactionDto.FromCashFlow).ToList();
    }
}
