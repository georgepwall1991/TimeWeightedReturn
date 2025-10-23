using Domain.Entities;
using MediatR;

namespace Application.Features.CashFlow.Commands.CreateCashFlow;

public record CreateCashFlowCommand(
    Guid AccountId,
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    CashFlowCategory Category,
    string? TransactionReference = null
) : IRequest<CreateCashFlowResponse>;

public record CreateCashFlowResponse(
    Guid Id,
    Guid AccountId,
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    CashFlowCategory Category,
    string? TransactionReference,
    DateTime CreatedAt
);
