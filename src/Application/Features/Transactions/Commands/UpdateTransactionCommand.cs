using Application.DTOs;
using MediatR;

namespace Application.Features.Transactions.Commands;

public record UpdateTransactionCommand(Guid TransactionId, UpdateTransactionRequest Request) : IRequest<TransactionDto>;
