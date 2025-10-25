using Application.DTOs;
using Application.Features.Transactions.Commands;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Transactions.Commands;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly PortfolioContext _context;

    public CreateTransactionCommandHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto> Handle(CreateTransactionCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Validate account exists
        var accountExists = await _context.Accounts
            .AnyAsync(a => a.Id == request.AccountId, cancellationToken);

        if (!accountExists)
            throw new InvalidOperationException($"Account with ID {request.AccountId} not found");

        // Determine the category based on the type
        var category = DetermineCashFlowCategory(request.Type);

        var cashFlow = new CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = request.AccountId,
            Date = request.Date,
            Amount = request.Amount,
            Description = request.Description,
            Type = request.Type,
            Category = category,
            TransactionReference = request.TransactionReference,
            BookOfRecord = BookOfRecord.ABoR, // Default to ABoR for manual entries
            Status = ReconciliationStatus.Approved, // Manual entries are auto-approved
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CashFlows.Add(cashFlow);
        await _context.SaveChangesAsync(cancellationToken);

        return TransactionDto.FromCashFlow(cashFlow);
    }

    private static CashFlowCategory DetermineCashFlowCategory(CashFlowType type)
    {
        return type switch
        {
            // Performance-Influencing
            CashFlowType.Dividend => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.DividendReinvested => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.BondCoupon => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.InterestEarned => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.RealizedGainLoss => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.ManagementFee => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.CustodyFee => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TransactionCost => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TaxWithholding => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.TaxReclaim => CashFlowCategory.PerformanceInfluencing,
            CashFlowType.ForeignExchangeGainLoss => CashFlowCategory.PerformanceInfluencing,

            // External Flows
            CashFlowType.ClientContribution => CashFlowCategory.ExternalFlow,
            CashFlowType.ClientWithdrawal => CashFlowCategory.ExternalFlow,
            CashFlowType.IncomeDistribution => CashFlowCategory.ExternalFlow,
            CashFlowType.TransferIn => CashFlowCategory.ExternalFlow,
            CashFlowType.TransferOut => CashFlowCategory.ExternalFlow,
            CashFlowType.ReturnOfCapital => CashFlowCategory.ExternalFlow,
            CashFlowType.CapitalCall => CashFlowCategory.ExternalFlow,
            CashFlowType.PerformanceFeePayment => CashFlowCategory.ExternalFlow,
            CashFlowType.EstimatedTaxPayment => CashFlowCategory.ExternalFlow,

            // Internal
            CashFlowType.InternalTransfer => CashFlowCategory.Internal,
            CashFlowType.CashSweep => CashFlowCategory.Internal,
            CashFlowType.SettlementAdjustment => CashFlowCategory.Internal,
            CashFlowType.AccruedInterestAdjustment => CashFlowCategory.Internal,

            _ => throw new ArgumentException($"Unknown CashFlowType: {type}")
        };
    }
}
