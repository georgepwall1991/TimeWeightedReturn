using MediatR;

namespace Application.Features.Transactions.Commands;

public record DeleteTransactionCommand(Guid TransactionId) : IRequest<bool>;
