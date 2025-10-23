using Application.Features.Portfolio.Queries.GetPortfolioHoldings;
using Application.Features.Portfolio.Queries.GetPortfolio;
using Application.Features.Portfolio.Commands.CreatePortfolio;
using Application.Features.Portfolio.Commands.UpdatePortfolio;
using Application.Features.Portfolio.Commands.DeletePortfolio;
using Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequirePortfolioManagerRole")]
public class PortfolioController : ControllerBase
{
    private readonly PortfolioContext _context;
    private readonly IMediator _mediator;

    public PortfolioController(IMediator mediator, PortfolioContext context)
    {
        _mediator = mediator;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetPortfolios([FromQuery] Guid? clientId = null)
    {
        var query = new GetPortfolioQuery(null, clientId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPortfolioById(Guid id)
    {
        var query = new GetPortfolioQuery(id);
        var result = await _mediator.Send(query);

        if (!result.Portfolios.Any())
        {
            return NotFound(new { message = $"Portfolio with ID {id} not found" });
        }

        return Ok(result.Portfolios.First());
    }

    [HttpPost]
    public async Task<IActionResult> CreatePortfolio([FromBody] CreatePortfolioCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetPortfolioById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePortfolio(Guid id, [FromBody] UpdatePortfolioRequest request)
    {
        var command = new UpdatePortfolioCommand(id, request.Name, request.ClientId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePortfolio(Guid id)
    {
        var command = new DeletePortfolioCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{portfolioId}/holdings")]
    public async Task<IActionResult> GetHoldings(
        Guid portfolioId,
        [FromQuery] string? date = null)
    {
        // Default to today if no date provided
        var targetDate = string.IsNullOrEmpty(date)
            ? DateOnly.FromDateTime(DateTime.Today)
            : DateOnly.Parse(date);

        var query = new GetPortfolioHoldingsQuery(portfolioId, targetDate);
        var response = await _mediator.Send(query);

        return Ok(new
        {
            PortfolioId = portfolioId,
            Date = targetDate.ToString("yyyy-MM-dd"),
            response.Holdings,
            response.TotalValueGBP,
            response.Holdings.Count
        });
    }
}

public record UpdatePortfolioRequest(string Name, Guid? ClientId = null);
