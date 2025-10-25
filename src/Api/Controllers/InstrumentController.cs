using Application.Features.Instrument.Commands.CreateInstrument;
using Application.Features.Instrument.Commands.DeleteInstrument;
using Application.Features.Instrument.Commands.UpdateInstrument;
using Application.Features.Instrument.DTOs;
using Application.Features.Instrument.Queries.GetInstrumentById;
using Application.Features.Instrument.Queries.GetInstruments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAnalystRole")]
public class InstrumentController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<InstrumentController> _logger;

    public InstrumentController(IMediator mediator, ILogger<InstrumentController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get all instruments
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Get all instruments", Description = "Returns a list of all instruments/securities in the system")]
    [SwaggerResponse(200, "Instruments retrieved successfully", typeof(List<InstrumentDto>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<List<InstrumentDto>>> GetInstruments()
    {
        var query = new GetInstrumentsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific instrument by ID
    /// </summary>
    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Get instrument by ID", Description = "Returns a specific instrument by its ID")]
    [SwaggerResponse(200, "Instrument retrieved successfully", typeof(InstrumentDto))]
    [SwaggerResponse(404, "Instrument not found")]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<InstrumentDto>> GetInstrumentById(Guid id)
    {
        var query = new GetInstrumentByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { message = $"Instrument with ID {id} not found" });

        return Ok(result);
    }

    /// <summary>
    /// Create a new instrument
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Create new instrument", Description = "Creates a new instrument/security with the specified details")]
    [SwaggerResponse(201, "Instrument created successfully", typeof(InstrumentDto))]
    [SwaggerResponse(400, "Bad request - invalid data or ticker already exists")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult<InstrumentDto>> CreateInstrument([FromBody] CreateInstrumentRequest request)
    {
        try
        {
            var command = new CreateInstrumentCommand(request);
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetInstrumentById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing instrument
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [SwaggerOperation(Summary = "Update instrument", Description = "Updates an existing instrument/security with new details")]
    [SwaggerResponse(200, "Instrument updated successfully", typeof(InstrumentDto))]
    [SwaggerResponse(400, "Bad request - invalid data or ticker conflict")]
    [SwaggerResponse(404, "Instrument not found")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Portfolio Manager role")]
    public async Task<ActionResult<InstrumentDto>> UpdateInstrument(Guid id, [FromBody] UpdateInstrumentRequest request)
    {
        try
        {
            var command = new UpdateInstrumentCommand(id, request);
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("not found"))
                return NotFound(new { message = ex.Message });

            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an instrument
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Policy = "RequireAdminRole")]
    [SwaggerOperation(Summary = "Delete instrument", Description = "Deletes an instrument/security. Cannot delete if instrument is used in any holdings.")]
    [SwaggerResponse(204, "Instrument deleted successfully")]
    [SwaggerResponse(400, "Bad request - instrument is being used in holdings")]
    [SwaggerResponse(404, "Instrument not found")]
    [SwaggerResponse(401, "Unauthorized")]
    [SwaggerResponse(403, "Forbidden - requires Admin role")]
    public async Task<IActionResult> DeleteInstrument(Guid id)
    {
        try
        {
            var command = new DeleteInstrumentCommand(id);
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound(new { message = $"Instrument with ID {id} not found" });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
