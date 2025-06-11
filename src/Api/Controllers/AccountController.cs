using Application.Features.Common.DTOs;
using Application.Features.Common.Interfaces;
using Application.Features.Analytics.Queries.CalculateTwr;
using Application.Features.Analytics.Queries.CalculateContribution;
using Application.Features.Analytics.Queries.CalculateRiskMetrics;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPortfolioRepository _portfolioRepository;

    public AccountController(IMediator mediator, IPortfolioRepository portfolioRepository)
    {
        _mediator = mediator;
        _portfolioRepository = portfolioRepository;
    }

    /// <summary>
    /// Get holdings for a specific account on a specific date
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="date">Date for holdings (defaults to today)</param>
    /// <returns>Account holdings with valuations</returns>
    [HttpGet("{accountId}/holdings")]
    public async Task<IActionResult> GetAccountHoldings(
        Guid accountId,
        [FromQuery] string? date = null)
    {
        try
        {
            // Default to today if no date provided
            var targetDate = string.IsNullOrEmpty(date)
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(date);

            var account = await _portfolioRepository.GetAccountAsync(accountId);
            if (account == null)
            {
                return NotFound($"Account with ID {accountId} not found");
            }

            var holdings = await _portfolioRepository.GetAccountHoldingsWithInstrumentDetailsAsync(accountId, targetDate);
            var totalValue = holdings.Sum(h => h.ValueGBP);

            return Ok(new
            {
                AccountId = accountId,
                AccountName = account.Name,
                Date = targetDate.ToString("yyyy-MM-dd"),
                Holdings = holdings.Select(h => new
                {
                    InstrumentId = h.HoldingId.ToString(), // Map to expected frontend field
                    Ticker = h.Ticker,
                    Name = h.InstrumentName,
                    Units = h.Units,
                    Price = h.Price,
                    ValueGBP = h.ValueGBP,
                    InstrumentType = h.InstrumentType,
                    Currency = h.Currency,
                    LocalValue = h.LocalValue,
                    FxRate = h.FxRate
                }),
                TotalValueGBP = totalValue,
                Count = holdings.Count()
            });
        }
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving account holdings", details = ex.Message });
        }
    }

    /// <summary>
    /// Get account information
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <returns>Account details</returns>
    [HttpGet("{accountId}")]
    public async Task<IActionResult> GetAccount(Guid accountId)
    {
        try
        {
            var account = await _portfolioRepository.GetAccountAsync(accountId);
            if (account == null)
            {
                return NotFound($"Account with ID {accountId} not found");
            }

            return Ok(new
            {
                Id = account.Id,
                Name = account.Name,
                AccountNumber = account.AccountNumber,
                Currency = account.Currency,
                PortfolioId = account.PortfolioId,
                CreatedAt = account.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving account details", details = ex.Message });
        }
    }

    /// <summary>
    /// Calculate Time Weighted Return for an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <returns>Time weighted return calculation</returns>
    [HttpGet("{accountId}/twr")]
    public async Task<IActionResult> CalculateTimeWeightedReturn(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        try
        {
            if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            {
                return BadRequest("Both 'from' and 'to' date parameters are required");
            }

            var startDate = DateOnly.Parse(from);
            var endDate = DateOnly.Parse(to);

            if (startDate >= endDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var query = new CalculateTwrQuery(accountId, startDate, endDate);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while calculating TWR", details = ex.Message });
        }
    }

    /// <summary>
    /// Get account value on a specific date
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="date">Valuation date (defaults to today)</param>
    /// <returns>Account value in GBP</returns>
    [HttpGet("{accountId}/value")]
    public async Task<IActionResult> GetAccountValue(
        Guid accountId,
        [FromQuery] string? date = null)
    {
        try
        {
            var targetDate = string.IsNullOrEmpty(date)
                ? DateOnly.FromDateTime(DateTime.Today)
                : DateOnly.Parse(date);

            var value = await _portfolioRepository.GetAccountValueAsync(accountId, targetDate);

            return Ok(new
            {
                AccountId = accountId,
                Date = targetDate.ToString("yyyy-MM-dd"),
                ValueGBP = value
            });
        }
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while retrieving account value", details = ex.Message });
        }
    }

    /// <summary>
    /// Calculate contribution analysis for an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <returns>Contribution analysis with instrument-level breakdown</returns>
    [HttpGet("{accountId}/contribution")]
    public async Task<IActionResult> CalculateContribution(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        try
        {
            if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            {
                return BadRequest("Both 'from' and 'to' date parameters are required");
            }

            var startDate = DateOnly.Parse(from);
            var endDate = DateOnly.Parse(to);

            if (startDate >= endDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var query = new CalculateContributionQuery(accountId, startDate, endDate);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while calculating contribution analysis", details = ex.Message });
        }
    }

    /// <summary>
    /// Calculate risk metrics for an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <param name="riskFreeRate">Risk-free rate (optional, defaults to 2%)</param>
    /// <returns>Comprehensive risk analysis including volatility, Sharpe ratio, drawdowns</returns>
    [HttpGet("{accountId}/risk")]
    public async Task<IActionResult> CalculateRiskMetrics(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] decimal? riskFreeRate = null)
    {
        try
        {
            if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            {
                return BadRequest("Both 'from' and 'to' date parameters are required");
            }

            var startDate = DateOnly.Parse(from);
            var endDate = DateOnly.Parse(to);

            if (startDate >= endDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var query = new CalculateRiskMetricsQuery(accountId, startDate, endDate, riskFreeRate);
            var result = await _mediator.Send(query);

            return Ok(result);
        }
        catch (FormatException)
        {
            return BadRequest("Invalid date format. Please use YYYY-MM-DD format.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while calculating risk metrics", details = ex.Message });
        }
    }
}
