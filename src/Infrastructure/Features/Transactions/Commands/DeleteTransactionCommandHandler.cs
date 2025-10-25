using Application.Features.Transactions.Commands;
using Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Features.Transactions.Commands;

public class DeleteTransactionCommandHandler : IRequestHandler<DeleteTransactionCommand, bool>
{
    private readonly PortfolioContext _context;

    public DeleteTransactionCommandHandler(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTransactionCommand command, CancellationToken cancellationToken)
    {
        var cashFlow = await _context.CashFlows
            .FirstOrDefaultAsync(cf => cf.Id == command.TransactionId, cancellationToken);

        if (cashFlow == null)
            return false;

        _context.CashFlows.Remove(cashFlow);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
