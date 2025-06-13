using Application.Features.Analytics.DTOs;
using Application.Features.Analytics.Queries.CalculateContribution;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContributionController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContributionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    ///     Calculate contribution analysis for an account over a specified period
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date for analysis</param>
    /// <param name="to">End date for analysis</param>
    /// <returns>Portfolio contribution analysis showing how each instrument contributed to performance</returns>
    [HttpGet("account/{accountId}")]
    public async Task<ActionResult<ContributionAnalysisResult>> GetContributionAnalysis(
        Guid accountId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to)
    {
        try
        {
            if (from >= to) return BadRequest(new { error = "Start date must be before end date" });

            var query = new CalculateContributionQuery(accountId, from, to);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = "Missing market data", details = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to calculate contribution analysis", details = ex.Message });
        }
    }

    /// <summary>
    ///     Get contribution summary showing top and worst performers
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date</param>
    /// <param name="to">End date</param>
    /// <returns>Summary of top and worst contributing instruments</returns>
    [HttpGet("account/{accountId}/summary")]
    public async Task<ActionResult<object>> GetContributionSummary(
        Guid accountId,
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to)
    {
        try
        {
            var query = new CalculateContributionQuery(accountId, from, to);
            var result = await _mediator.Send(query);

            var summary = new
            {
                result.AccountId,
                result.AccountName,
                result.StartDate,
                result.EndDate,
                result.TotalPortfolioReturn,
                result.AnnualizedReturn,
                TopContributor = new
                {
                    Ticker = result.TopContributorTicker,
                    Contribution = result.TopContributorReturn
                },
                WorstContributor = new
                {
                    Ticker = result.WorstContributorTicker,
                    Contribution = result.WorstContributorReturn
                },
                InstrumentCount = result.InstrumentContributions.Count,
                TotalValueGBP = result.EndValueGBP
            };

            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to get contribution summary", details = ex.Message });
        }
    }
}
