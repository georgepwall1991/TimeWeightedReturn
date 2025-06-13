using Application.Features.Portfolio.DTOs;
using Application.Features.Portfolio.Queries.GetPortfolioTree;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TreeController : ControllerBase
{
    private readonly IMediator _mediator;

    public TreeController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    ///     Get hierarchical portfolio tree structure
    /// </summary>
    /// <param name="clientId">Optional: Filter to specific client</param>
    /// <param name="date">Date for holdings values (defaults to today)</param>
    /// <param name="metricsFrom">Start date for performance metrics calculation</param>
    /// <param name="metricsTo">End date for performance metrics calculation</param>
    /// <returns>Hierarchical tree of clients, portfolios, and accounts</returns>
    [HttpGet]
    public async Task<ActionResult<PortfolioTreeResponse>> GetPortfolioTree(
        [FromQuery] Guid? clientId = null,
        [FromQuery] DateOnly? date = null,
        [FromQuery] DateOnly? metricsFrom = null,
        [FromQuery] DateOnly? metricsTo = null)
    {
        try
        {
            var query = new GetPortfolioTreeQuery(clientId, date, metricsFrom, metricsTo);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Failed to retrieve portfolio tree", details = ex.Message });
        }
    }

    /// <summary>
    ///     Get tree structure for a specific client with performance metrics
    /// </summary>
    /// <param name="clientId">Client ID</param>
    /// <param name="from">Start date for metrics</param>
    /// <param name="to">End date for metrics</param>
    /// <returns>Client tree with performance metrics</returns>
    [HttpGet("client/{clientId}")]
    public async Task<ActionResult<PortfolioTreeResponse>> GetClientTree(
        Guid clientId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to)
    {
        try
        {
            var query = new GetPortfolioTreeQuery(
                clientId,
                to, // Use end date for current values
                from,
                to);

            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Failed to retrieve client tree", details = ex.Message });
        }
    }

    /// <summary>
    ///     Get tree structure with current values only (no performance metrics)
    /// </summary>
    /// <param name="date">Date for holdings values (defaults to today)</param>
    /// <returns>Tree structure with current values</returns>
    [HttpGet("current")]
    public async Task<ActionResult<PortfolioTreeResponse>> GetCurrentTree([FromQuery] DateOnly? date = null)
    {
        try
        {
            var query = new GetPortfolioTreeQuery(Date: date);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = "Failed to retrieve current tree", details = ex.Message });
        }
    }
}
