using Application.Interfaces;
using Domain.Services;
using Domain.ValueObjects;
using MediatR;
using Microsoft.Extensions.Logging;
using IPortfolioRepository = Application.Features.Common.Interfaces.IPortfolioRepository;

namespace Application.Features.Analytics.Queries.CalculateEnhancedTwr;

/// <summary>
/// Handler for Enhanced TWR calculation with proper cash flow handling
/// </summary>
public class CalculateEnhancedTwrHandler : IRequestHandler<CalculateEnhancedTwrQuery, EnhancedTwrResponse>
{
    private readonly IAccountRepository _accountRepository;
    private readonly IPortfolioRepository _portfolioRepository;
    private readonly ICashFlowRepository _cashFlowRepository;
    private readonly EnhancedTimeWeightedReturnService _enhancedTwrService;
    private readonly ILogger<CalculateEnhancedTwrHandler> _logger;

    public CalculateEnhancedTwrHandler(
        IAccountRepository accountRepository,
        IPortfolioRepository portfolioRepository,
        ICashFlowRepository cashFlowRepository,
        EnhancedTimeWeightedReturnService enhancedTwrService,
        ILogger<CalculateEnhancedTwrHandler> logger)
    {
        _accountRepository = accountRepository;
        _portfolioRepository = portfolioRepository;
        _cashFlowRepository = cashFlowRepository;
        _enhancedTwrService = enhancedTwrService;
        _logger = logger;
    }

    public async Task<EnhancedTwrResponse> Handle(CalculateEnhancedTwrQuery request, CancellationToken cancellationToken)
    {
        // Validate account exists
        var account = await _accountRepository.GetAccountByIdAsync(request.AccountId, cancellationToken);
        if (account == null)
        {
            throw new KeyNotFoundException($"Account with ID {request.AccountId} not found");
        }

        // Fetch all cash flows in the period
        var cashFlows = await _cashFlowRepository.GetCashFlowsAsync(
            accountId: request.AccountId,
            startDate: request.StartDate,
            endDate: request.EndDate,
            cancellationToken: cancellationToken);

        // Build valuation points from account holdings
        var valuationPoints = await BuildValuationPoints(request.AccountId, request.StartDate, request.EndDate, cancellationToken);

        if (!valuationPoints.Any())
        {
            throw new InvalidOperationException(
                $"No holdings data found for account {request.AccountId} in the period {request.StartDate} to {request.EndDate}. " +
                "Cannot calculate TWR without valuation data.");
        }

        // Create date range
        var period = new DateRange(request.StartDate, request.EndDate);

        // Calculate enhanced TWR
        var result = _enhancedTwrService.Calculate(valuationPoints, cashFlows, period);

        _logger.LogInformation(
            "Enhanced TWR calculated for account {AccountId}: {Return:P2} ({AnnualizedReturn:P2} annualized) over {Days} days with {ExternalFlows} external flows and {PerformanceFlows} performance flows",
            request.AccountId,
            result.TotalReturn,
            result.AnnualizedReturn,
            result.TotalDays,
            result.ExternalFlowCount,
            result.PerformanceFlowCount);

        // Map to response DTO
        return new EnhancedTwrResponse(
            AccountId: request.AccountId,
            StartDate: request.StartDate,
            EndDate: request.EndDate,
            TimeWeightedReturn: result.TotalReturn,
            AnnualizedReturn: result.AnnualizedReturn,
            Days: result.TotalDays,
            NumberOfSubPeriods: result.SubPeriods.Count,
            StartValue: result.SubPeriods.FirstOrDefault()?.StartValue ?? 0m,
            EndValue: result.SubPeriods.LastOrDefault()?.EndValue ?? 0m,
            ExternalFlowCount: result.ExternalFlowCount,
            PerformanceFlowCount: result.PerformanceFlowCount,
            SubPeriods: result.SubPeriods.Select(sp => new SubPeriodDetailDto(
                StartDate: sp.StartDate,
                EndDate: sp.EndDate,
                StartValue: sp.StartValue,
                EndValue: sp.EndValue,
                Return: sp.Return,
                Days: sp.Days,
                TotalPerformanceFlow: sp.TotalPerformanceFlow,
                PerformanceFlows: sp.PerformanceFlows.Select(cf => new CashFlowDetailDto(
                    Date: cf.Date,
                    Amount: cf.Amount,
                    Type: cf.Type.ToString(),
                    Description: cf.Description
                )).ToList()
            )).ToList()
        );
    }

    /// <summary>
    /// Build valuation points from account holdings over time
    /// This samples the account value at regular intervals or whenever holdings change
    /// </summary>
    private async Task<List<ValuationPoint>> BuildValuationPoints(
        Guid accountId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var valuationPoints = new List<ValuationPoint>();

        // Get all holding dates in the range to determine when valuations should be sampled
        var holdingDates = await _portfolioRepository.GetHoldingDatesInRangeAsync(accountId, startDate, endDate);

        if (!holdingDates.Any())
        {
            // If no holdings exist in the period, return empty list
            _logger.LogWarning("No holdings found for account {AccountId} between {StartDate} and {EndDate}",
                accountId, startDate, endDate);
            return valuationPoints;
        }

        // Ensure we have start and end dates
        var allDates = holdingDates.ToList();
        if (!allDates.Contains(startDate))
        {
            allDates.Insert(0, startDate);
        }
        if (!allDates.Contains(endDate))
        {
            allDates.Add(endDate);
        }

        allDates = allDates.Distinct().OrderBy(d => d).ToList();

        // Create valuation points for each date
        foreach (var date in allDates)
        {
            var value = await _portfolioRepository.GetAccountValueAsync(accountId, date);
            valuationPoints.Add(new ValuationPoint
            {
                Date = date,
                Value = value
            });
        }

        _logger.LogInformation(
            "Built {Count} valuation points for account {AccountId} from {StartDate} to {EndDate}",
            valuationPoints.Count,
            accountId,
            startDate,
            endDate);

        return valuationPoints;
    }
}
