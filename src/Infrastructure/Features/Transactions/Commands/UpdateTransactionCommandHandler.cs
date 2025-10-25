using Application.DTOs;
using Application.Features.Transactions.Commands;
using Domain.Entities;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Transactions.Commands;

public class UpdateTransactionCommandHandler : IRequestHandler<UpdateTransactionCommand, TransactionDto>
{
    private readonly PortfolioContext _context;

    public UpdateTransactionCommandHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<TransactionDto> Handle(UpdateTransactionCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var cashFlow = await _context.CashFlows
            .FirstOrDefaultAsync(cf => cf.Id == command.TransactionId, cancellationToken);

        if (cashFlow == null)
            throw new InvalidOperationException($"Transaction with ID {command.TransactionId} not found");

        // Update fields
        cashFlow.Date = request.Date;
        cashFlow.Amount = request.Amount;
        cashFlow.Description = request.Description;
        cashFlow.Type = request.Type;
        cashFlow.TransactionReference = request.TransactionReference;
        cashFlow.Category = DetermineCashFlowCategory(request.Type);
        cashFlow.UpdatedAt = DateTime.UtcNow;

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
