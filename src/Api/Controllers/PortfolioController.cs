using Application.Features.Portfolio.Queries.GetPortfolioHoldings;
using Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<IActionResult> GetPortfolios()
    {
        var portfolios = await _context.Portfolios
            .Include(p => p.Client)
            .Include(p => p.Accounts)
            .AsNoTracking()
            .Select(p => new
            {
                p.Id,
                p.Name,
                ClientName = p.Client.Name,
                AccountCount = p.Accounts.Count
            })
            .ToListAsync();

        return Ok(portfolios);
    }

    [HttpGet("{portfolioId}/holdings")]
    public async Task<IActionResult> GetHoldings(
        Guid portfolioId,
        [FromQuery] string? date = null)
    {
        try
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
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            // Log the exception in production
            return StatusCode(500, "An error occurred while retrieving holdings.");
        }
    }
}
