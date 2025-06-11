using Application.Features.Analytics.DTOs;
using Application.Features.Common.Interfaces;
using Domain.Services;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Analytics.Queries.CalculateTwr;

public class CalculateTwrHandler : IRequestHandler<CalculateTwrQuery, TwrResult>
{
    private readonly IPortfolioRepository _repository;
    private readonly TimeWeightedReturnService _twrService;

    public CalculateTwrHandler(IPortfolioRepository repository, TimeWeightedReturnService twrService)
    {
        _repository = repository;
        _twrService = twrService;
    }

    public async Task<TwrResult> Handle(CalculateTwrQuery request, CancellationToken cancellationToken)
    {
        var dateRange = new DateRange(request.StartDate, request.EndDate);

        // Get all dates where holdings exist for this account in the period
        var holdingDates = await _repository.GetHoldingDatesInRangeAsync(
            request.AccountId,
            request.StartDate,
            request.EndDate);

        if (!holdingDates.Any())
        {
            throw new InvalidOperationException(
                $"No holdings found for account {request.AccountId} in period {request.StartDate} to {request.EndDate}");
        }

        // Ensure we have start and end dates in our holding dates
        var allDates = holdingDates.ToList();
        if (!allDates.Contains(request.StartDate))
        {
            allDates.Insert(0, request.StartDate);
        }
        if (!allDates.Contains(request.EndDate))
        {
            allDates.Add(request.EndDate);
        }

        allDates = allDates.Distinct().OrderBy(d => d).ToList();

        // For now, we'll treat the entire period as one sub-period (no cash flows)
        // In future sprints, we'll detect cash flows and split periods accordingly
        var subPeriods = new List<SubPeriod>();

        for (int i = 0; i < allDates.Count - 1; i++)
        {
            var startDate = allDates[i];
            var endDate = allDates[i + 1];

            var startValue = await _repository.GetAccountValueAsync(request.AccountId, startDate);
            var endValue = await _repository.GetAccountValueAsync(request.AccountId, endDate);

            // For now, assume no net flows (we'll enhance this in future iterations)
            var netFlow = 0m;

            if (startValue > 0) // Only create sub-period if we have a valid start value
            {
                subPeriods.Add(new SubPeriod(startValue, endValue, netFlow));
            }
        }

        if (!subPeriods.Any())
        {
            throw new InvalidOperationException(
                $"No valid sub-periods found for TWR calculation");
        }

        // Calculate TWR
        var twr = _twrService.Calculate(subPeriods);
        var annualizedReturn = _twrService.AnnualizeReturn(twr, dateRange.Days);

        // Get start and end values for the result
        var totalStartValue = await _repository.GetAccountValueAsync(request.AccountId, request.StartDate);
        var totalEndValue = await _repository.GetAccountValueAsync(request.AccountId, request.EndDate);

        return new TwrResult
        {
            AccountId = request.AccountId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TimeWeightedReturn = twr,
            AnnualizedReturn = annualizedReturn,
            Days = dateRange.Days,
            NumberOfSubPeriods = subPeriods.Count,
            StartValue = totalStartValue,
            EndValue = totalEndValue,
            TotalNetFlows = subPeriods.Sum(p => p.NetFlow)
        };
    }
}
