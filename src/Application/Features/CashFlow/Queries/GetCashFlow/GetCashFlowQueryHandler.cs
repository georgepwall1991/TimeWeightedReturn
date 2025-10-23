using Application.Interfaces;
using MediatR;

namespace Application.Features.CashFlow.Queries.GetCashFlow;

public class GetCashFlowQueryHandler : IRequestHandler<GetCashFlowQuery, GetCashFlowResponse>
{
    private readonly ICashFlowRepository _cashFlowRepository;

    public GetCashFlowQueryHandler(ICashFlowRepository cashFlowRepository)
    {
        _cashFlowRepository = cashFlowRepository;
    }

    public async Task<GetCashFlowResponse> Handle(GetCashFlowQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.CashFlow> cashFlows;

        if (request.Id.HasValue)
        {
            var cashFlow = await _cashFlowRepository.GetCashFlowByIdAsync(request.Id.Value, cancellationToken);
            cashFlows = cashFlow != null ? new List<Domain.Entities.CashFlow> { cashFlow } : new List<Domain.Entities.CashFlow>();
        }
        else
        {
            cashFlows = await _cashFlowRepository.GetCashFlowsAsync(
                request.AccountId,
                request.StartDate,
                request.EndDate,
                request.Category,
                cancellationToken
            );
        }

        var cashFlowDtos = cashFlows.Select(cf => new CashFlowDto(
            cf.Id,
            cf.AccountId,
            cf.Account.Name,
            cf.Date,
            cf.Amount,
            cf.Description,
            cf.Type,
            cf.Type.ToString(),
            cf.Category,
            cf.Category.ToString(),
            cf.TransactionReference,
            cf.CreatedAt,
            cf.UpdatedAt
        )).ToList();

        return new GetCashFlowResponse(cashFlowDtos);
    }
}
