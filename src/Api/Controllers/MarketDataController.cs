using Application.Features.MarketData.Commands;
using Application.Features.MarketData.DTOs;
using Application.Features.MarketData.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MarketDataController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<MarketDataController> _logger;

    public MarketDataController(IMediator mediator, ILogger<MarketDataController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Refresh prices for all instruments
    /// </summary>
    [HttpPost("refresh")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Refresh prices for all instruments", Description = "Fetches latest prices from market data providers for all securities")]
    [SwaggerResponse(200, "Prices refreshed successfully", typeof(MarketDataStatus))]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult<MarketDataStatus>> RefreshAllPrices([FromQuery] DateOnly? date = null)
    {
        _logger.LogInformation("Refreshing all prices for date: {Date}", date);

        var command = new RefreshAllPricesCommand(date);
        var result = await _mediator.Send(command);

        return Ok(result);
    }

    /// <summary>
    /// Refresh price for a specific instrument
    /// </summary>
    [HttpPost("refresh/{instrumentId:guid}")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Refresh price for specific instrument", Description = "Fetches latest price from market data providers for a specific security")]
    [SwaggerResponse(200, "Price refreshed successfully")]
    [SwaggerResponse(404, "Instrument not found")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult> RefreshInstrumentPrice(Guid instrumentId, [FromQuery] DateOnly? date = null)
    {
        _logger.LogInformation("Refreshing price for instrument {InstrumentId} for date: {Date}", instrumentId, date);

        var command = new RefreshInstrumentPriceCommand(instrumentId, date);
        var result = await _mediator.Send(command);

        if (!result)
        {
            return NotFound(new { message = "Instrument not found or price refresh failed" });
        }

        return Ok(new { message = "Price refreshed successfully" });
    }

    /// <summary>
    /// Get market data status for all instruments
    /// </summary>
    [HttpGet("status")]
    [SwaggerOperation(Summary = "Get market data status", Description = "Returns status of price data for all securities")]
    [SwaggerResponse(200, "Status retrieved successfully", typeof(IEnumerable<InstrumentPriceStatus>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<IEnumerable<InstrumentPriceStatus>>> GetStatus()
    {
        _logger.LogInformation("Getting market data status");

        var query = new GetMarketDataStatusQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Validate if a ticker exists in market data providers
    /// </summary>
    [HttpPost("validate/{ticker}")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Validate ticker", Description = "Checks if a ticker symbol exists in any market data provider")]
    [SwaggerResponse(200, "Ticker validation result", typeof(TickerValidationResult))]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult<TickerValidationResult>> ValidateTicker(string ticker)
    {
        _logger.LogInformation("Validating ticker: {Ticker}", ticker);

        var query = new ValidateTickerQuery(ticker);
        var isValid = await _mediator.Send(query);

        return Ok(new TickerValidationResult(ticker, isValid));
    }
}

public record TickerValidationResult(string Ticker, bool IsValid);
