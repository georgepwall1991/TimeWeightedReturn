using Domain.Entities;
using MediatR;

namespace Application.Features.CashFlow.Commands.UpdateCashFlow;

public record UpdateCashFlowCommand(
    Guid Id,
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    CashFlowCategory Category,
    string? TransactionReference = null
) : IRequest<UpdateCashFlowResponse>;

public record UpdateCashFlowResponse(
    Guid Id,
    Guid AccountId,
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    CashFlowCategory Category,
    string? TransactionReference,
    DateTime UpdatedAt
);
