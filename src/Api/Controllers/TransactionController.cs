using Application.DTOs;
using Application.Features.Transactions.Commands;
using Infrastructure.Features.Transactions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly IMediator _mediator;

    public TransactionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all transactions for an account
    /// </summary>
    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<List<TransactionDto>>> GetTransactions(
        Guid accountId,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null)
    {
        var filters = new TransactionFilters
        {
            StartDate = startDate,
            EndDate = endDate
        };

        var query = new GetTransactionsQuery(accountId, filters);
        var transactions = await _mediator.Send(query);
        return Ok(transactions);
    }

    /// <summary>
    /// Create a new transaction
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TransactionDto>> CreateTransaction(
        [FromBody] CreateTransactionRequest request)
    {
        try
        {
            var command = new CreateTransactionCommand(request);
            var transaction = await _mediator.Send(command);
            return CreatedAtAction(
                nameof(GetTransactions),
                new { accountId = transaction.AccountId },
                transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing transaction
    /// </summary>
    [HttpPut("{transactionId}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(
        Guid transactionId,
        [FromBody] UpdateTransactionRequest request)
    {
        try
        {
            var command = new UpdateTransactionCommand(transactionId, request);
            var transaction = await _mediator.Send(command);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a transaction
    /// </summary>
    [HttpDelete("{transactionId}")]
    public async Task<ActionResult> DeleteTransaction(Guid transactionId)
    {
        var command = new DeleteTransactionCommand(transactionId);
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { message = $"Transaction with ID {transactionId} not found" });

        return NoContent();
    }
}
