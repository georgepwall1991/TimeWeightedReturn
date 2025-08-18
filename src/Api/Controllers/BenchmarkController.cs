using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BenchmarkController : ControllerBase
    {
        private readonly PortfolioContext _context;

        public BenchmarkController(PortfolioContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetBenchmarks()
        {
            var benchmarks = await _context.Benchmarks.ToListAsync();
            return Ok(benchmarks);
        }
    }
}
