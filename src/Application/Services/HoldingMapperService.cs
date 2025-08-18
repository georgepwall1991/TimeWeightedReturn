using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Features.Portfolio.DTOs;
using Domain.Entities;
using Domain.Interfaces;
using System;

namespace Application.Services
{
    public class HoldingMapperService : IHoldingMapperService
    {
        private readonly ICurrencyConversionService _currencyService;
        private readonly IPortfolioRepository _portfolioRepository;

        public HoldingMapperService(ICurrencyConversionService currencyService, IPortfolioRepository portfolioRepository)
        {
            _currencyService = currencyService;
            _portfolioRepository = portfolioRepository;
        }

        public async Task<List<HoldingDto>> MapHoldingsToDtosAsync(IEnumerable<Holding> holdings, DateOnly date)
        {
            if (!holdings.Any())
                return new List<HoldingDto>();

            var instrumentIds = holdings.Select(h => h.InstrumentId).ToList();
            var prices = await _portfolioRepository.GetPricesAsync(instrumentIds, date);

            var currencies = holdings.Select(h => h.Instrument.Currency).Distinct().ToList();
            var fxRates = await _portfolioRepository.GetFxRatesAsync(currencies, date);

            var result = new List<HoldingDto>();
            foreach (var holding in holdings)
            {
                var price = prices.FirstOrDefault(p => p.InstrumentId == holding.InstrumentId);
                if (price == null)
                    throw new InvalidOperationException($"No price found for instrument {holding.Instrument.Ticker} on {date}");

                var localValue = holding.Units * price.Value;
                var fxRate = _currencyService.GetFxRate(holding.Instrument.Currency, date, fxRates);
                var valueGbp = _currencyService.ConvertToGbp(localValue, holding.Instrument.Currency, date, fxRates);

                result.Add(new HoldingDto
                {
                    HoldingId = holding.Id,
                    Ticker = holding.Instrument.Ticker,
                    Name = holding.Instrument.Name,
                    InstrumentType = holding.Instrument.Type.ToString(),
                    Currency = holding.Instrument.Currency,
                    Units = holding.Units,
                    Price = price.Value,
                    LocalValue = localValue,
                    FxRate = fxRate,
                    ValueGBP = valueGbp,
                    Date = holding.Date
                });
            }

            return result
                .OrderBy(h => h.InstrumentType == "Cash" ? 0 : 1)
                .ThenBy(h => h.Ticker)
                .ToList();
        }
    }
}
