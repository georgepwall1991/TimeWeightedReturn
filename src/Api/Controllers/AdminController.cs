using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[Authorize(Policy = "RequireAdminRole")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly PortfolioContext _context;

    public AdminController(PortfolioContext context)
    {
        _context = context;
    }

    [HttpPost("seed-test-data")]
    public async Task<IActionResult> SeedTestData()
    {
        var seeder = new TestDataSeeder(_context);
        await seeder.SeedHistoricalDataAsync();
        return Ok(new { message = "Test data seeded successfully", timestamp = DateTime.UtcNow });
    }

    [HttpGet("data-summary")]
    public async Task<IActionResult> GetDataSummary()
    {
        var summary = new
        {
            Clients = await _context.Clients.CountAsync(),
            Portfolios = await _context.Portfolios.CountAsync(),
            Accounts = await _context.Accounts.CountAsync(),
            Holdings = await _context.Holdings.CountAsync(),
            Instruments = await _context.Instruments.CountAsync(),
            Prices = await _context.Prices.CountAsync(),
            FxRates = await _context.FxRates.CountAsync(),
            CashFlows = await _context.CashFlows.CountAsync(),
            DateRange = new
            {
                OldestPrice = await _context.Prices.MinAsync(p => (DateOnly?)p.Date),
                NewestPrice = await _context.Prices.MaxAsync(p => (DateOnly?)p.Date),
                OldestHolding = await _context.Holdings.MinAsync(h => (DateOnly?)h.Date),
                NewestHolding = await _context.Holdings.MaxAsync(h => (DateOnly?)h.Date)
            }
        };

        return Ok(summary);
    }
}
