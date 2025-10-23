using Application.Interfaces;
using MediatR;

namespace Application.Features.CashFlow.Commands.CreateCashFlow;

public class CreateCashFlowCommandHandler : IRequestHandler<CreateCashFlowCommand, CreateCashFlowResponse>
{
    private readonly ICashFlowRepository _cashFlowRepository;

    public CreateCashFlowCommandHandler(ICashFlowRepository cashFlowRepository)
    {
        _cashFlowRepository = cashFlowRepository;
    }

    public async Task<CreateCashFlowResponse> Handle(CreateCashFlowCommand request, CancellationToken cancellationToken)
    {
        // Verify account exists
        var accountExists = await _cashFlowRepository.AccountExistsAsync(request.AccountId, cancellationToken);

        if (!accountExists)
        {
            throw new KeyNotFoundException($"Account with ID {request.AccountId} not found");
        }

        var cashFlow = new Domain.Entities.CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = request.AccountId,
            Date = request.Date,
            Amount = request.Amount,
            Description = request.Description,
            Type = request.Type,
            Category = request.Category,
            TransactionReference = request.TransactionReference,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _cashFlowRepository.CreateCashFlowAsync(cashFlow, cancellationToken);

        return new CreateCashFlowResponse(
            cashFlow.Id,
            cashFlow.AccountId,
            cashFlow.Date,
            cashFlow.Amount,
            cashFlow.Description,
            cashFlow.Type,
            cashFlow.Category,
            cashFlow.TransactionReference,
            cashFlow.CreatedAt
        );
    }
}
