using Application.Features.Client.Commands.CreateClient;
using Application.Features.Client.Commands.DeleteClient;
using Application.Features.Client.Commands.UpdateClient;
using Application.Features.Client.Queries.GetClient;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequirePortfolioManagerRole")]
public class ClientController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ClientController> _logger;

    public ClientController(IMediator mediator, ILogger<ClientController> _logger)
    {
        _mediator = mediator;
        this._logger = _logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllClients()
    {
        var query = new GetClientQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClientById(Guid id)
    {
        var query = new GetClientQuery(id);
        var result = await _mediator.Send(query);

        if (!result.Clients.Any())
        {
            return NotFound(new { message = $"Client with ID {id} not found" });
        }

        return Ok(result.Clients.First());
    }

    [HttpPost]
    public async Task<IActionResult> CreateClient([FromBody] CreateClientCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetClientById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClient(Guid id, [FromBody] UpdateClientRequest request)
    {
        var command = new UpdateClientCommand(id, request.Name);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClient(Guid id)
    {
        var command = new DeleteClientCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public record UpdateClientRequest(string Name);
