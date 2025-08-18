using System;
using System.Threading.Tasks;
using Domain.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttributionController : ControllerBase
    {
        private readonly AttributionAnalysisService _attributionAnalysisService;

        public AttributionController(AttributionAnalysisService attributionAnalysisService)
        {
            _attributionAnalysisService = attributionAnalysisService;
        }

        [HttpGet("{portfolioId}")]
        public async Task<IActionResult> GetAttribution(
            Guid portfolioId,
            [FromQuery] Guid benchmarkId,
            [FromQuery] DateOnly startDate,
            [FromQuery] DateOnly endDate)
        {
            try
            {
                var result = await _attributionAnalysisService.CalculateAsync(portfolioId, benchmarkId, startDate, endDate);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Failed to calculate attribution", details = ex.Message });
            }
        }
    }
}
