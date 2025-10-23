using Domain.Entities;
using MediatR;

namespace Application.Features.CashFlow.Queries.GetCashFlow;

public record GetCashFlowQuery(
    Guid? Id = null,
    Guid? AccountId = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    CashFlowCategory? Category = null
) : IRequest<GetCashFlowResponse>;

public record GetCashFlowResponse(List<CashFlowDto> CashFlows);

public record CashFlowDto(
    Guid Id,
    Guid AccountId,
    string AccountName,
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    string TypeName,
    CashFlowCategory Category,
    string CategoryName,
    string? TransactionReference,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
