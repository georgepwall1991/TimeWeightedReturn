using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErrorController : ControllerBase
{
    private readonly ILogger<ErrorController> _logger;

    public ErrorController(ILogger<ErrorController> logger)
    {
        _logger = logger;
    }

    [HttpPost("client")]
    public IActionResult LogClientError([FromBody] ClientErrorReport request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _logger.LogError("Client Error: {Message} | Stack: {Stack} | URL: {Url} | UserAgent: {UserAgent} | UserId: {UserId} | Timestamp: {Timestamp}",
            request.Message,
            request.Stack,
            request.Url,
            request.UserAgent,
            request.UserId,
            request.Timestamp);

        // Return minimal response to avoid leaking server information
        return Ok(new { logged = true });
    }

    [HttpPost("javascript")]
    public IActionResult LogJavaScriptError([FromBody] JavaScriptErrorReport request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _logger.LogError("JavaScript Error: {Message} | Source: {Source} | Line: {Line} | Column: {Column} | URL: {Url} | UserAgent: {UserAgent} | Timestamp: {Timestamp}",
            request.Message,
            request.Source,
            request.Line,
            request.Column,
            request.Url,
            request.UserAgent,
            request.Timestamp);

        return Ok(new { logged = true });
    }
}

public class ClientErrorReport
{
    [Required]
    public string Message { get; set; } = string.Empty;

    public string? Stack { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty;

    public string? UserAgent { get; set; }

    public string? UserId { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    public string? ComponentStack { get; set; }

    public Dictionary<string, object>? AdditionalInfo { get; set; }
}

public class JavaScriptErrorReport
{
    [Required]
    public string Message { get; set; } = string.Empty;

    public string? Source { get; set; }

    public int? Line { get; set; }

    public int? Column { get; set; }

    [Required]
    public string Url { get; set; } = string.Empty;

    public string? UserAgent { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }
}
