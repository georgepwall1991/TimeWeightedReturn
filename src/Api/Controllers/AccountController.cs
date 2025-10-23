using System.Text;
using Application.Features.Account.Commands.CreateAccount;
using Application.Features.Account.Commands.DeleteAccount;
using Application.Features.Account.Commands.UpdateAccount;
using Application.Features.Account.Queries.GetAccount;
using Application.Features.Analytics.Queries.CalculateContribution;
using Application.Features.Analytics.Queries.CalculateEnhancedTwr;
using Application.Features.Analytics.Queries.CalculateRiskMetrics;
using Application.Features.Analytics.Queries.CalculateTwr;
using Application.Features.Common.Interfaces;
using Application.Features.Portfolio.DTOs;
using ClosedXML.Excel;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ILogger<AccountController> _logger;

    public AccountController(
        IMediator mediator,
        IPortfolioRepository portfolioRepository,
        ILogger<AccountController> logger)
    {
        _mediator = mediator;
        _portfolioRepository = portfolioRepository;
        _logger = logger;
    }

    // CRUD Endpoints

    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [HttpGet]
    public async Task<IActionResult> GetAllAccounts([FromQuery] Guid? portfolioId = null)
    {
        var query = new GetAccountQuery(null, portfolioId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccountById(Guid id)
    {
        var query = new GetAccountQuery(id);
        var result = await _mediator.Send(query);

        if (!result.Accounts.Any())
        {
            return NotFound(new { message = $"Account with ID {id} not found" });
        }

        return Ok(result.Accounts.First());
    }

    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAccountById), new { id = result.Id }, result);
    }

    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(Guid id, [FromBody] UpdateAccountRequest request)
    {
        var command = new UpdateAccountCommand(id, request.Name, request.AccountNumber, request.Currency, request.PortfolioId);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize(Policy = "RequirePortfolioManagerRole")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(Guid id)
    {
        var command = new DeleteAccountCommand(id);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // Analytics and Data Endpoints

    /// <summary>
    ///     Get holdings for a specific account on a specific date
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="date">Date for holdings (defaults to today)</param>
    /// <returns>Account holdings with valuations</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/holdings")]
    public async Task<IActionResult> GetAccountHoldings(
        Guid accountId,
        [FromQuery] string? date = null)
    {
        // Default to today if no date provided
        var targetDate = string.IsNullOrEmpty(date)
            ? DateOnly.FromDateTime(DateTime.Today)
            : DateOnly.Parse(date);

        var account = await _portfolioRepository.GetAccountAsync(accountId);
        if (account == null) return NotFound($"Account with ID {accountId} not found");

        // Get available dates to find the nearest date with data
        var endDate = DateOnly.FromDateTime(DateTime.Today);
        var startDate = endDate.AddYears(-2);
        var availableDates = await _portfolioRepository.GetHoldingDatesInRangeAsync(accountId, startDate, endDate);

        if (!availableDates.Any())
            return Ok(new
            {
                AccountId = accountId,
                AccountName = account.Name,
                Date = targetDate.ToString("yyyy-MM-dd"),
                Holdings = Array.Empty<object>(),
                TotalValueGBP = 0m,
                Count = 0,
                Message = "No holdings data available for this account",
                DataStatus = "NoData"
            });

        // Find the nearest available date
        var nearestDate = availableDates
            .Where(d => d <= targetDate)
            .OrderByDescending(d => d)
            .FirstOrDefault();

        // If no date before target, use earliest available date
        if (nearestDate == default) nearestDate = availableDates.Min();

        var holdings =
            await _portfolioRepository.GetAccountHoldingsWithInstrumentDetailsAsync(accountId, nearestDate);
        var totalValue = holdings.Sum(h => h.ValueGBP);

        var response = new
        {
            AccountId = accountId,
            AccountName = account.Name,
            RequestedDate = targetDate.ToString("yyyy-MM-dd"),
            ActualDate = nearestDate.ToString("yyyy-MM-dd"),
            Holdings = holdings.Select(h => new
            {
                InstrumentId = h.HoldingId.ToString(),
                h.Ticker,
                Name = h.Name,
                h.Units,
                h.Price,
                h.ValueGBP,
                h.InstrumentType,
                h.Currency,
                h.LocalValue,
                h.FxRate
            }),
            TotalValueGBP = totalValue,
            Count = holdings.Count(),
            DataStatus = nearestDate == targetDate ? "Exact" : "Nearest",
            AvailableDateRange = new
            {
                Earliest = availableDates.Min().ToString("yyyy-MM-dd"),
                Latest = availableDates.Max().ToString("yyyy-MM-dd"),
                TotalDates = availableDates.Count()
            }
        };

        return Ok(response);
    }

    // This endpoint has been consolidated with GetAccountById above to avoid route conflicts
    // Analytics endpoints use the CRUD endpoint for basic account details

    /// <summary>
    ///     Calculate Time Weighted Return for an account (basic calculation without cash flow analysis)
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <returns>Time weighted return calculation</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/twr")]
    public async Task<IActionResult> CalculateTimeWeightedReturn(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            return BadRequest("Both 'from' and 'to' date parameters are required");

        var startDate = DateOnly.Parse(from);
        var endDate = DateOnly.Parse(to);

        if (startDate >= endDate)
            return BadRequest("Start date must be before end date");

        var query = new CalculateTwrQuery(accountId, startDate, endDate);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    ///     Calculate Enhanced Time Weighted Return with proper cash flow handling (GIPS-compliant)
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <returns>Enhanced TWR calculation with sub-period breakdown and cash flow categorization</returns>
    /// <remarks>
    /// This endpoint uses the Enhanced TWR methodology which:
    /// - Categorizes cash flows by GIPS standards (External, Performance-Influencing, Internal)
    /// - Breaks calculation into sub-periods at external cash flow dates
    /// - Includes performance-influencing flows in return calculations
    /// - Provides detailed sub-period analysis
    /// </remarks>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/twr/enhanced")]
    public async Task<IActionResult> CalculateEnhancedTimeWeightedReturn(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
        {
            return BadRequest(new
            {
                error = "Both 'from' and 'to' date parameters are required",
                example = "?from=2024-01-01&to=2024-12-31"
            });
        }

        if (!DateOnly.TryParse(from, out var startDate))
            return BadRequest(new { error = "Invalid 'from' date format. Use YYYY-MM-DD" });

        if (!DateOnly.TryParse(to, out var endDate))
            return BadRequest(new { error = "Invalid 'to' date format. Use YYYY-MM-DD" });

        if (startDate >= endDate)
            return BadRequest(new { error = "Start date must be before end date" });

        var query = new CalculateEnhancedTwrQuery(accountId, startDate, endDate);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    ///     Get account value on a specific date
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="date">Valuation date (defaults to today)</param>
    /// <returns>Account value in GBP</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/value")]
    public async Task<IActionResult> GetAccountValue(
        Guid accountId,
        [FromQuery] string? date = null)
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

    /// <summary>
    ///     Calculate contribution analysis for an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <returns>Contribution analysis with instrument-level breakdown</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/contribution")]
    public async Task<IActionResult> CalculateContribution(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            return BadRequest("Both 'from' and 'to' date parameters are required");

        var startDate = DateOnly.Parse(from);
        var endDate = DateOnly.Parse(to);

        if (startDate >= endDate) return BadRequest("Start date must be before end date");

        var query = new CalculateContributionQuery(accountId, startDate, endDate);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    ///     Calculate risk metrics for an account
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="from">Start date (YYYY-MM-DD)</param>
    /// <param name="to">End date (YYYY-MM-DD)</param>
    /// <param name="riskFreeRate">Risk-free rate (optional, defaults to 2%)</param>
    /// <returns>Comprehensive risk analysis including volatility, Sharpe ratio, drawdowns</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/risk")]
    public async Task<IActionResult> CalculateRiskMetrics(
        Guid accountId,
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] decimal? riskFreeRate = null)
    {
        if (string.IsNullOrEmpty(from) || string.IsNullOrEmpty(to))
            return BadRequest("Both 'from' and 'to' date parameters are required");

        var startDate = DateOnly.Parse(from);
        var endDate = DateOnly.Parse(to);

        if (startDate >= endDate) return BadRequest("Start date must be before end date");

        var query = new CalculateRiskMetricsQuery(accountId, startDate, endDate, riskFreeRate);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>
    ///     Get available dates for an account's holdings
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <returns>List of dates where holdings data is available</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/dates")]
    public async Task<IActionResult> GetAccountDates(Guid accountId)
    {
        var account = await _portfolioRepository.GetAccountAsync(accountId);
        if (account == null) return NotFound($"Account with ID {accountId} not found");

        // Get dates from 2 years ago to today
        var endDate = DateOnly.FromDateTime(DateTime.Today);
        var startDate = endDate.AddYears(-2);

        var dates = await _portfolioRepository.GetHoldingDatesInRangeAsync(accountId, startDate, endDate);

        return Ok(new
        {
            AccountId = accountId,
            AccountName = account.Name,
            Dates = dates.Select(d => d.ToString("yyyy-MM-dd")).ToList(),
            StartDate = startDate.ToString("yyyy-MM-dd"),
            EndDate = endDate.ToString("yyyy-MM-dd")
        });
    }

    /// <summary>
    ///     Get historical holdings data for an account within a date range
    /// </summary>
    /// <param name="accountId">Account ID</param>
    /// <param name="startDate">Start date (YYYY-MM-DD)</param>
    /// <param name="endDate">End date (YYYY-MM-DD)</param>
    /// <returns>Historical holdings data with valuations</returns>
    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("{accountId}/holdings/history")]
    public async Task<IActionResult> GetAccountHoldingsHistory(
        Guid accountId,
        [FromQuery] string startDate,
        [FromQuery] string endDate)
    {
        if (string.IsNullOrEmpty(startDate) || string.IsNullOrEmpty(endDate))
            return BadRequest("Both 'startDate' and 'endDate' parameters are required");

        var start = DateOnly.Parse(startDate);
        var end = DateOnly.Parse(endDate);

        if (start >= end) return BadRequest("Start date must be before end date");

        var account = await _portfolioRepository.GetAccountAsync(accountId);
        if (account == null) return NotFound($"Account with ID {accountId} not found");

        // Get all dates where holdings exist in the period
        var availableDates = await _portfolioRepository.GetHoldingDatesInRangeAsync(accountId, start, end);

        if (!availableDates.Any())
            return Ok(new GetAccountHoldingsHistoryResponse
            {
                AccountId = accountId.ToString(),
                AccountName = account.Name,
                StartDate = startDate,
                EndDate = endDate,
                HistoricalData = [],
                AvailableDateRange = new DateRangeInfo
                {
                    Earliest = startDate,
                    Latest = endDate,
                    TotalDates = 0
                }
            });

        // Get holdings for each date
        var historicalData = new List<HistoricalDataPoint>();
        foreach (var date in availableDates)
        {
            var holdings = await _portfolioRepository.GetAccountHoldingsWithInstrumentDetailsAsync(accountId, date);
            var totalValue = holdings.Sum(h => h.ValueGBP);

            historicalData.Add(new HistoricalDataPoint
            {
                Date = date.ToString("yyyy-MM-dd"),
                Holdings = holdings,
                TotalValueGBP = totalValue,
                Count = holdings.Count
            });
        }

        return Ok(new GetAccountHoldingsHistoryResponse
        {
            AccountId = accountId.ToString(),
            AccountName = account.Name,
            StartDate = startDate,
            EndDate = endDate,
            HistoricalData = historicalData,
            AvailableDateRange = new DateRangeInfo
            {
                Earliest = availableDates.Min().ToString("yyyy-MM-dd"),
                Latest = availableDates.Max().ToString("yyyy-MM-dd"),
                TotalDates = availableDates.Count
            }
        });
    }

    [Authorize(Policy = "RequireAnalystRole")]
    [HttpGet("s/{accountId}/holdings/export")]
    public async Task<IActionResult> ExportHoldings(
        Guid accountId,
        [FromQuery] DateOnly date,
        [FromQuery] string format = "csv")
    {
        var holdings = await _portfolioRepository.GetAccountHoldingsWithInstrumentDetailsAsync(accountId, date);
        if (!holdings.Any()) return NotFound(new { message = "No holdings data available for the specified date" });

        if (format.ToLower() == "excel") return await ExportToExcel(holdings, date);

        return await ExportToCsv(holdings, date);
    }

    private Task<IActionResult> ExportToExcel(List<HoldingDto> holdings, DateOnly date)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Holdings");

        // Add headers
        worksheet.Cell(1, 1).Value = "Ticker";
        worksheet.Cell(1, 2).Value = "Name";
        worksheet.Cell(1, 3).Value = "Units";
        worksheet.Cell(1, 4).Value = "Price";
        worksheet.Cell(1, 5).Value = "Currency";
        worksheet.Cell(1, 6).Value = "Value (GBP)";
        worksheet.Cell(1, 7).Value = "Type";

        // Add data
        var row = 2;
        foreach (var holding in holdings)
        {
            worksheet.Cell(row, 1).Value = holding.Ticker;
            worksheet.Cell(row, 2).Value = holding.Name;
            worksheet.Cell(row, 3).Value = holding.Units;
            worksheet.Cell(row, 4).Value = holding.Price;
            worksheet.Cell(row, 5).Value = holding.Currency;
            worksheet.Cell(row, 6).Value = holding.ValueGBP;
            worksheet.Cell(row, 7).Value = holding.InstrumentType;
            row++;
        }

        // Style the worksheet
        var range = worksheet.Range(1, 1, row - 1, 7);
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
        worksheet.Row(1).Style.Font.Bold = true;

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Create the Excel file in memory
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return Task.FromResult<IActionResult>(File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"holdings-{date:yyyy-MM-dd}.xlsx"
        ));
    }

    private Task<IActionResult> ExportToCsv(List<HoldingDto> holdings, DateOnly date)
    {
        var csv = new StringBuilder();
        csv.AppendLine("Ticker,Name,Units,Price,Currency,Value (GBP),Type");

        foreach (var holding in holdings)
            csv.AppendLine($"{holding.Ticker}," +
                           $"{EscapeCsvField(holding.Name)}," +
                           $"{holding.Units}," +
                           $"{holding.Price}," +
                           $"{holding.Currency}," +
                           $"{holding.ValueGBP}," +
                           $"{holding.InstrumentType}");

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        return Task.FromResult<IActionResult>(File(bytes, "text/csv", $"holdings-{date:yyyy-MM-dd}.csv"));
    }

    private string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field)) return "";
        if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            return $"\"{field.Replace("\"", "\"\"")}\"";
        return field;
    }
}

public class GetAccountHoldingsHistoryResponse
{
    public string AccountId { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
    public List<HistoricalDataPoint> HistoricalData { get; set; } = [];
    public DateRangeInfo AvailableDateRange { get; set; } = new();
}

public class HistoricalDataPoint
{
    public string Date { get; set; } = string.Empty;
    public List<HoldingDto> Holdings { get; set; } = [];
    public decimal TotalValueGBP { get; set; }
    public int Count { get; set; }
}

public class DateRangeInfo
{
    public string Earliest { get; set; } = string.Empty;
    public string Latest { get; set; } = string.Empty;
    public int TotalDates { get; set; }
}

public record UpdateAccountRequest(string Name, string AccountNumber, string Currency, Guid? PortfolioId = null);
