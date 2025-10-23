using Application.Features.Benchmark.Commands;
using Application.Features.Benchmark.DTOs;
using Application.Features.Benchmark.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAnalystRole")]
public class BenchmarkController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<BenchmarkController> _logger;

    public BenchmarkController(IMediator mediator, ILogger<BenchmarkController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all active benchmarks
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<BenchmarkDto>>> GetBenchmarks()
    {
        var query = new GetBenchmarksQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific benchmark by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<BenchmarkDto>> GetBenchmarkById(Guid id)
    {
        var query = new GetBenchmarkByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"Benchmark with ID {id} not found" });

        return Ok(result);
    }

    /// <summary>
    /// Create a new benchmark
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    public async Task<ActionResult<BenchmarkDto>> CreateBenchmark([FromBody] CreateBenchmarkRequest request)
    {
        var command = new CreateBenchmarkCommand(
            request.Name,
            request.IndexSymbol,
            request.Description,
            request.Currency ?? "USD"
        );

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetBenchmarkById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Update an existing benchmark
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    public async Task<ActionResult<BenchmarkDto>> UpdateBenchmark(Guid id, [FromBody] UpdateBenchmarkRequest request)
    {
        var command = new UpdateBenchmarkCommand(
            id,
            request.Name,
            request.Description,
            request.IsActive
        );

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Delete a benchmark
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    public async Task<IActionResult> DeleteBenchmark(Guid id)
    {
        var command = new DeleteBenchmarkCommand(id);
        var result = await _mediator.Send(command);

        if (!result)
            return NotFound(new { message = $"Benchmark with ID {id} not found" });

        return NoContent();
    }

    /// <summary>
    /// Compare account performance against a benchmark
    /// </summary>
    /// <param name="accountId">Account ID to compare</param>
    /// <param name="benchmarkId">Benchmark ID to compare against</param>
    /// <param name="startDate">Start date (YYYY-MM-DD)</param>
    /// <param name="endDate">End date (YYYY-MM-DD)</param>
    [HttpGet("compare/{accountId}")]
    public async Task<ActionResult<BenchmarkComparisonDto>> CompareToBenchmark(
        Guid accountId,
        [FromQuery] Guid benchmarkId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
            return BadRequest(new { error = "Both startDate and endDate are required in YYYY-MM-DD format" });

        var parsedStartDate = DateOnly.Parse(startDate);
        var parsedEndDate = DateOnly.Parse(endDate);

        if (parsedEndDate <= parsedStartDate)
            return BadRequest(new { error = "End date must be after start date" });

        var query = new CompareToBenchmarkQuery(accountId, benchmarkId, parsedStartDate, parsedEndDate);
        var result = await _mediator.Send(query);

        return Ok(result);
    }
}

public record CreateBenchmarkRequest(
    string Name,
    string IndexSymbol,
    string? Description,
    string? Currency
);

public record UpdateBenchmarkRequest(
    string Name,
    string? Description,
    bool IsActive
);
