using Application.Features.CashFlow.Commands.CreateCashFlow;
using Application.Features.CashFlow.Commands.DeleteCashFlow;
using Application.Features.CashFlow.Commands.UpdateCashFlow;
using Application.Features.CashFlow.Queries.GetCashFlow;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequirePortfolioManagerRole")]
public class CashFlowController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<CashFlowController> _logger;

    public CashFlowController(IMediator mediator, ILogger<CashFlowController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get cash flows with optional filtering
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCashFlows(
        [FromQuery] Guid? accountId = null,
        [FromQuery] string? startDate = null,
        [FromQuery] string? endDate = null,
        [FromQuery] CashFlowCategory? category = null)
    {
        DateOnly? parsedStartDate = null;
        DateOnly? parsedEndDate = null;

        if (!string.IsNullOrEmpty(startDate) && DateOnly.TryParse(startDate, out var sd))
        {
            parsedStartDate = sd;
        }

        if (!string.IsNullOrEmpty(endDate) && DateOnly.TryParse(endDate, out var ed))
        {
            parsedEndDate = ed;
        }

        var query = new GetCashFlowQuery(null, accountId, parsedStartDate, parsedEndDate, category);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific cash flow by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCashFlowById(Guid id)
    {
        var query = new GetCashFlowQuery(id);
        var result = await _mediator.Send(query);

        if (!result.CashFlows.Any())
        {
            return NotFound(new { message = $"Cash flow with ID {id} not found" });
        }

        return Ok(result.CashFlows.First());
    }

    /// <summary>
    /// Create a new cash flow
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCashFlow([FromBody] CreateCashFlowCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetCashFlowById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing cash flow
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCashFlow(Guid id, [FromBody] UpdateCashFlowRequest request)
    {
        var command = new UpdateCashFlowCommand(
            id,
            request.Date,
            request.Amount,
            request.Description,
            request.Type,
            request.Category,
            request.TransactionReference
        );
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete a cash flow
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCashFlow(Guid id)
    {
        var command = new DeleteCashFlowCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record UpdateCashFlowRequest(
    DateOnly Date,
    decimal Amount,
    string Description,
    CashFlowType Type,
    CashFlowCategory Category,
    string? TransactionReference = null
);
