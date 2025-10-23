using MediatR;

namespace Application.Features.CashFlow.Commands.DeleteCashFlow;

public record DeleteCashFlowCommand(Guid Id) : IRequest<DeleteCashFlowResponse>;

public record DeleteCashFlowResponse(bool Success, string Message);
