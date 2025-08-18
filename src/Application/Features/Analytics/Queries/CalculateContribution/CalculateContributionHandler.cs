using Application.Features.Analytics.DTOs;
using Domain.Interfaces;
using Domain.Services;
using Application.Services;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Analytics.Queries.CalculateContribution;

public class CalculateContributionHandler : IRequestHandler<CalculateContributionQuery, ContributionAnalysisResult>
{
    private readonly ContributionAnalysisService _contributionService;
    private readonly IPortfolioRepository _repository;
    private readonly TimeWeightedReturnService _twrService;
    private readonly IHoldingMapperService _holdingMapperService;

    public CalculateContributionHandler(
        IPortfolioRepository repository,
        ContributionAnalysisService contributionService,
        TimeWeightedReturnService twrService,
        IHoldingMapperService holdingMapperService)
    {
        _repository = repository;
        _contributionService = contributionService;
        _twrService = twrService;
        _holdingMapperService = holdingMapperService;
    }

    public async Task<ContributionAnalysisResult> Handle(CalculateContributionQuery request,
        CancellationToken cancellationToken)
    {
        var account = await _repository.GetAccountAsync(request.AccountId);
        if (account == null) throw new ArgumentException($"Account with ID {request.AccountId} not found");

        // Get holdings for start and end dates
        var startHoldingsEntities =
            await _repository.GetAccountHoldingsWithInstrumentDetailsAsync(request.AccountId, request.StartDate);
        var endHoldingsEntities =
            await _repository.GetAccountHoldingsWithInstrumentDetailsAsync(request.AccountId, request.EndDate);

        var startHoldings = await _holdingMapperService.MapHoldingsToDtosAsync(startHoldingsEntities, request.StartDate);
        var endHoldings = await _holdingMapperService.MapHoldingsToDtosAsync(endHoldingsEntities, request.EndDate);

        // Calculate total portfolio values
        var totalStartValue = startHoldings.Sum(h => h.ValueGBP);
        var totalEndValue = endHoldings.Sum(h => h.ValueGBP);

        // Calculate overall portfolio return
        var portfolioReturn = _contributionService.CalculatePortfolioReturn(totalStartValue, totalEndValue);
        var totalAbsoluteReturn = totalEndValue - totalStartValue;

        // Calculate contribution for each instrument
        var instrumentContributions = new List<ContributionData>();

        foreach (var startHolding in startHoldings)
        {
            var endHolding = endHoldings.FirstOrDefault(h => h.Ticker == startHolding.Ticker);

            if (endHolding != null)
            {
                var contribution = _contributionService.CalculateContribution(
                    startHolding.ValueGBP,
                    endHolding.ValueGBP,
                    totalStartValue,
                    totalEndValue);

                var percentageContribution = _contributionService.CalculatePercentageContribution(
                    contribution.AbsoluteContribution,
                    totalAbsoluteReturn);

                var instrumentType = Enum.TryParse<InstrumentType>(startHolding.InstrumentType, out var type)
                    ? type
                    : InstrumentType.Security;

                instrumentContributions.Add(new ContributionData
                {
                    InstrumentId = startHolding.HoldingId.ToString(),
                    Ticker = startHolding.Ticker,
                    Name = startHolding.Name,
                    Currency = startHolding.Currency,
                    Type = instrumentType,
                    Units = startHolding.Units,
                    StartPrice = startHolding.Price,
                    EndPrice = endHolding.Price,
                    StartValueGBP = startHolding.ValueGBP,
                    EndValueGBP = endHolding.ValueGBP,
                    Weight = contribution.Weight,
                    InstrumentReturn = contribution.InstrumentReturn,
                    Contribution = contribution.Contribution,
                    AbsoluteContribution = contribution.AbsoluteContribution,
                    PercentageContribution = percentageContribution
                });
            }
        }

        // Calculate summary statistics
        var contributionPairs = instrumentContributions.Select(c => (c.Ticker, c.Contribution)).ToList();
        var (topContributor, worstContributor) = _contributionService.GetTopAndWorstContributors(contributionPairs);

        // Calculate annualized return
        var dateRange = new DateRange(request.StartDate, request.EndDate);
        var annualizedReturn = _twrService.AnnualizeReturn(portfolioReturn, dateRange.Days);

        return new ContributionAnalysisResult
        {
            AccountId = request.AccountId,
            AccountName = account.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Days = dateRange.Days,
            TotalPortfolioReturn = portfolioReturn,
            AnnualizedReturn = annualizedReturn,
            StartValueGBP = totalStartValue,
            EndValueGBP = totalEndValue,
            InstrumentContributions = instrumentContributions.OrderByDescending(c => c.Contribution).ToList(),
            TopContributorReturn = topContributor.Contribution,
            WorstContributorReturn = worstContributor.Contribution,
            TopContributorTicker = topContributor.Ticker,
            WorstContributorTicker = worstContributor.Ticker
        };
    }
}
