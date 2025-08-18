using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;

namespace Domain.Services
{
    public class AttributionAnalysisService
    {
        private readonly IPortfolioRepository _portfolioRepository;

        public AttributionAnalysisService(IPortfolioRepository portfolioRepository)
        {
            _portfolioRepository = portfolioRepository;
        }

        public async Task<AttributionAnalysisResult> CalculateAsync(Guid portfolioId, Guid benchmarkId, DateOnly startDate, DateOnly endDate)
        {
            var portfolio = await _portfolioRepository.GetPortfolioWithHoldingsAsync(portfolioId, startDate);
            var benchmark = await _portfolioRepository.GetBenchmarkWithHoldingsAsync(benchmarkId);

            if (portfolio == null || benchmark == null)
            {
                throw new InvalidOperationException("Portfolio or Benchmark not found.");
            }

            var portfolioTotalValue = portfolio.Accounts.SelectMany(a => a.Holdings).Sum(h => h.Units * h.Instrument.Prices.First(p => p.Date == startDate).Value);
            var benchmarkTotalValue = benchmark.Holdings.Sum(h => h.Weight); // Assuming benchmark weights sum to 1

            var results = new List<AttributionResult>();

            foreach (var holding in portfolio.Accounts.SelectMany(a => a.Holdings))
            {
                var instrumentId = holding.InstrumentId;
                var portfolioWeight = (holding.Units * holding.Instrument.Prices.First(p => p.Date == startDate).Value) / portfolioTotalValue;
                var benchmarkHolding = benchmark.Holdings.FirstOrDefault(h => h.InstrumentId == instrumentId);
                var benchmarkWeight = benchmarkHolding?.Weight ?? 0;

                var portfolioReturn = await _portfolioRepository.GetInstrumentReturnAsync(instrumentId, startDate, endDate);
                var benchmarkReturn = await _portfolioRepository.GetInstrumentReturnAsync(instrumentId, startDate, endDate); // Assuming same return for simplicity

                var allocationEffect = (portfolioWeight - benchmarkWeight) * benchmarkReturn;
                var selectionEffect = benchmarkWeight * (portfolioReturn - benchmarkReturn);
                var interactionEffect = (portfolioWeight - benchmarkWeight) * (portfolioReturn - benchmarkReturn);

                results.Add(new AttributionResult
                {
                    InstrumentName = holding.Instrument.Name,
                    AllocationEffect = allocationEffect,
                    SelectionEffect = selectionEffect,
                    InteractionEffect = interactionEffect,
                    TotalEffect = allocationEffect + selectionEffect + interactionEffect
                });
            }

            var totalAllocationEffect = results.Sum(r => r.AllocationEffect);
            var totalSelectionEffect = results.Sum(r => r.SelectionEffect);
            var totalInteractionEffect = results.Sum(r => r.InteractionEffect);
            var totalEffect = results.Sum(r => r.TotalEffect);

            return new AttributionAnalysisResult
            {
                AllocationEffect = totalAllocationEffect,
                SelectionEffect = totalSelectionEffect,
                InteractionEffect = totalInteractionEffect,
                TotalEffect = totalEffect,
                Results = results
            };
        }
    }

    public class AttributionAnalysisResult
    {
        public decimal AllocationEffect { get; set; }
        public decimal SelectionEffect { get; set; }
        public decimal InteractionEffect { get; set; }
        public decimal TotalEffect { get; set; }
        public List<AttributionResult> Results { get; set; } = new List<AttributionResult>();
    }

    public class AttributionResult
    {
        public string InstrumentName { get; set; } = string.Empty;
        public decimal AllocationEffect { get; set; }
        public decimal SelectionEffect { get; set; }
        public decimal InteractionEffect { get; set; }
        public decimal TotalEffect { get; set; }
    }
}
