using Application.Features.FxRates.Commands;
using Application.Features.FxRates.DTOs;
using Application.Features.FxRates.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FxRatesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<FxRatesController> _logger;

    public FxRatesController(IMediator mediator, ILogger<FxRatesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Refresh FX rates for all currency pairs in use
    /// </summary>
    [HttpPost("refresh")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Refresh all FX rates", Description = "Fetches latest FX rates for all currency pairs used in the system")]
    [SwaggerResponse(200, "FX rates refreshed successfully", typeof(FxRateUpdateStatus))]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult<FxRateUpdateStatus>> RefreshAllFxRates([FromQuery] DateOnly? date = null)
    {
        _logger.LogInformation("Refreshing all FX rates for date: {Date}", date);

        var command = new RefreshAllFxRatesCommand(date);
        var result = await _mediator.Send(command);

        return Ok(result);
    }

    /// <summary>
    /// Refresh FX rate for a specific currency pair
    /// </summary>
    [HttpPost("refresh/{baseCurrency}/{quoteCurrency}")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Refresh specific FX rate", Description = "Fetches latest FX rate for a specific currency pair")]
    [SwaggerResponse(200, "FX rate refreshed successfully")]
    [SwaggerResponse(404, "Currency pair not found or refresh failed")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult> RefreshFxRate(string baseCurrency, string quoteCurrency, [FromQuery] DateOnly? date = null)
    {
        _logger.LogInformation("Refreshing FX rate for {Base}/{Quote} for date: {Date}", baseCurrency, quoteCurrency, date);

        var command = new RefreshFxRateCommand(baseCurrency, quoteCurrency, date);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { message = "Currency pair not found or FX rate refresh failed" });
        }

        return Ok(new { message = "FX rate refreshed successfully" });
    }

    /// <summary>
    /// Get FX rate status for all currency pairs
    /// </summary>
    [HttpGet("status")]
    [SwaggerOperation(Summary = "Get FX rate status", Description = "Returns status of FX rate data for all currency pairs")]
    [SwaggerResponse(200, "Status retrieved successfully", typeof(IEnumerable<CurrencyPairStatus>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<IEnumerable<CurrencyPairStatus>>> GetStatus()
    {
        _logger.LogInformation("Getting FX rate status");

        var query = new GetFxRateStatusQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}
