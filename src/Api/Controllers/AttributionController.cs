using Application.Features.Analytics.Queries.CalculateAttribution;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAnalystRole")]
public class AttributionController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AttributionController> _logger;

    public AttributionController(IMediator mediator, ILogger<AttributionController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Calculate Brinson-Fachler attribution analysis for a portfolio vs benchmark
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="startDate">Start date (YYYY-MM-DD)</param>
    /// <param name="endDate">End date (YYYY-MM-DD)</param>
    /// <param name="benchmark">Benchmark ticker (default: SPY for S&P 500)</param>
    /// <returns>Attribution analysis decomposing active return into allocation, selection, and interaction effects</returns>
    [HttpGet("account/{accountId}")]
    public async Task<IActionResult> CalculateAttribution(
        Guid accountId,
        [FromQuery] string startDate,
        [FromQuery] string endDate,
        [FromQuery] string benchmark = "SPY")
    {
        if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
        {
            return BadRequest(new
            {
                error = "Both startDate and endDate are required",
                example = "?startDate=2024-01-01&endDate=2024-12-31"
            });
        }

        if (!DateOnly.TryParse(startDate, out var parsedStartDate))
        {
            return BadRequest(new { error = "Invalid startDate format. Use YYYY-MM-DD" });
        }

        if (!DateOnly.TryParse(endDate, out var parsedEndDate))
        {
            return BadRequest(new { error = "Invalid endDate format. Use YYYY-MM-DD" });
        }

        if (parsedEndDate <= parsedStartDate)
        {
            return BadRequest(new { error = "End date must be after start date" });
        }

        var query = new CalculateAttributionQuery(accountId, parsedStartDate, parsedEndDate, benchmark);
        var result = await _mediator.Send(query);

        return Ok(new
        {
            accountId,
            startDate = parsedStartDate.ToString("yyyy-MM-dd"),
            endDate = parsedEndDate.ToString("yyyy-MM-dd"),
            benchmark,
            attribution = result
        });
    }
}
