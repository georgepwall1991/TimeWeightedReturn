using Application.DTOs;
using MediatR;

namespace Application.Features.Transactions.Commands;

public record CreateTransactionCommand(CreateTransactionRequest Request) : IRequest<TransactionDto>;
