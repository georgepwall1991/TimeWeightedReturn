using Application.Features.DataHealth.DTOs;
using Application.Features.DataHealth.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DataHealthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<DataHealthController> _logger;

    public DataHealthController(IMediator mediator, ILogger<DataHealthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get overall data health summary
    /// </summary>
    [HttpGet("overall")]
    [SwaggerOperation(Summary = "Get overall data health", Description = "Returns a comprehensive summary of data freshness across all data types")]
    [SwaggerResponse(200, "Health summary retrieved successfully", typeof(DataHealthSummary))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<DataHealthSummary>> GetOverallHealth()
    {
        _logger.LogInformation("Getting overall data health");

        var query = new GetOverallHealthQuery();
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    /// Get all data health issues
    /// </summary>
    [HttpGet("issues")]
    [SwaggerOperation(Summary = "Get all health issues", Description = "Returns detailed list of all data staleness issues")]
    [SwaggerResponse(200, "Health issues retrieved successfully", typeof(IEnumerable<DataHealthDetail>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<IEnumerable<DataHealthDetail>>> GetAllHealthIssues(
        [FromQuery] HealthSeverity? minimumSeverity = null)
    {
        _logger.LogInformation("Getting all health issues with minimum severity: {Severity}", minimumSeverity);

        var query = new GetAllHealthIssuesQuery(minimumSeverity);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}
