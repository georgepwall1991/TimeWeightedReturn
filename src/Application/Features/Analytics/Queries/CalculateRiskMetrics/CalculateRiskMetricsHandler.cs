using Application.Features.Analytics.DTOs;
using Application.Features.Common.Interfaces;
using Domain.Services;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Analytics.Queries.CalculateRiskMetrics;

public class CalculateRiskMetricsHandler : IRequestHandler<CalculateRiskMetricsQuery, RiskMetricsAnalysisResult>
{
    private readonly IPortfolioRepository _repository;
    private readonly RiskMetricsService _riskService;

    public CalculateRiskMetricsHandler(
        IPortfolioRepository repository,
        RiskMetricsService riskService)
    {
        _repository = repository;
        _riskService = riskService;
    }

    public async Task<RiskMetricsAnalysisResult> Handle(CalculateRiskMetricsQuery request, CancellationToken cancellationToken)
    {
        var account = await _repository.GetAccountAsync(request.AccountId);
        if (account == null)
        {
            throw new ArgumentException($"Account with ID {request.AccountId} not found");
        }

        // Get daily portfolio values for the period
        var (portfolioValues, dates) = await GetPortfolioValueTimeSeries(request.AccountId, request.StartDate, request.EndDate);

        if (portfolioValues.Count < 2)
        {
            return CreateEmptyResult(request, account.Name);
        }

        // Calculate risk metrics
        var riskFreeRate = request.RiskFreeRate ?? 0.02m; // Default 2%
        var riskMetrics = _riskService.CalculateRiskMetrics(portfolioValues, dates, riskFreeRate);

        // Calculate rolling volatility for charting
        var rollingVolatility = _riskService.CalculateRollingVolatility(portfolioValues, dates, 30);

        // Generate risk assessment
        var riskAssessment = GenerateRiskAssessment(riskMetrics);

        // Map to DTO
        return new RiskMetricsAnalysisResult
        {
            AccountId = request.AccountId,
            AccountName = account.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Days = (request.EndDate - request.StartDate).Days,
            AnnualizedVolatility = riskMetrics.AnnualizedVolatility,
            SharpeRatio = riskMetrics.SharpeRatio,
            MaximumDrawdown = riskMetrics.MaximumDrawdown,
            CurrentDrawdown = riskMetrics.CurrentDrawdown,
            ValueAtRisk95 = riskMetrics.ValueAtRisk95,
            AnnualizedReturn = riskMetrics.AnnualizedReturn,
            RiskFreeRate = riskFreeRate,
            RiskProfile = DetermineRiskProfile(riskMetrics),
            DrawdownPeriods = riskMetrics.DrawdownPeriods.Select(d => new DrawdownPeriodData
            {
                StartDate = d.StartDate,
                EndDate = d.EndDate,
                MaxDrawdown = d.MaxDrawdown,
                DurationDays = d.DurationDays,
                IsRecovered = d.EndDate < request.EndDate
            }).ToList(),
            RollingVolatility = rollingVolatility.Select(rv => new RollingVolatilityData
            {
                Date = rv.Date,
                AnnualizedVolatility = rv.AnnualizedVolatility
            }).ToList(),
            RiskAssessment = riskAssessment
        };
    }

    private async Task<(List<decimal> values, List<DateOnly> dates)> GetPortfolioValueTimeSeries(
        Guid accountId,
        DateOnly startDate,
        DateOnly endDate)
    {
        var values = new List<decimal>();
        var dates = new List<DateOnly>();

        // Get values for every few days to create a realistic time series
        var currentDate = startDate;
        while (currentDate <= endDate)
        {
            try
            {
                var value = await _repository.GetAccountValueAsync(accountId, currentDate);
                if (value > 0)
                {
                    values.Add(value);
                    dates.Add(currentDate);
                }
            }
            catch
            {
                // Skip dates with no data
            }

            // Move to next data point (every 7 days for reasonable sample size)
            currentDate = currentDate.AddDays(7);
        }

        // Ensure we have the end date
        if (dates.LastOrDefault() != endDate)
        {
            try
            {
                var endValue = await _repository.GetAccountValueAsync(accountId, endDate);
                if (endValue > 0)
                {
                    values.Add(endValue);
                    dates.Add(endDate);
                }
            }
            catch
            {
                // End date value not available
            }
        }

        return (values, dates);
    }

    private RiskAssessment GenerateRiskAssessment(RiskMetricsResult metrics)
    {
        var warnings = new List<string>();
        var positives = new List<string>();

        // Volatility assessment
        var volCategory = metrics.AnnualizedVolatility switch
        {
            < 0.05m => "Low",
            < 0.15m => "Medium",
            _ => "High"
        };

        if (metrics.AnnualizedVolatility > 0.20m)
            warnings.Add("High volatility indicates significant price swings");
        else if (metrics.AnnualizedVolatility < 0.08m)
            positives.Add("Low volatility suggests stable returns");

        // Sharpe ratio assessment
        var sharpeCategory = metrics.SharpeRatio switch
        {
            < 0.5m => "Poor",
            < 1.0m => "Fair",
            < 2.0m => "Good",
            _ => "Excellent"
        };

        if (metrics.SharpeRatio > 1.0m)
            positives.Add("Strong risk-adjusted returns");
        else if (metrics.SharpeRatio < 0.5m)
            warnings.Add("Poor risk-adjusted performance");

        // Drawdown assessment
        var drawdownCategory = metrics.MaximumDrawdown switch
        {
            < 0.05m => "Minimal",
            < 0.15m => "Moderate",
            _ => "Severe"
        };

        if (metrics.MaximumDrawdown > 0.20m)
            warnings.Add("Large drawdowns may test investor patience");
        else if (metrics.MaximumDrawdown < 0.10m)
            positives.Add("Controlled downside risk");

        if (metrics.CurrentDrawdown > 0.05m)
            warnings.Add("Currently experiencing a drawdown period");

        // Overall risk score (1-10 scale)
        var riskScore = CalculateRiskScore(metrics);

        var overallAssessment = riskScore switch
        {
            >= 8 => "Low Risk - Conservative profile with steady returns",
            >= 6 => "Medium Risk - Balanced risk-return profile",
            >= 4 => "High Risk - Aggressive growth strategy",
            _ => "Very High Risk - Speculative investments"
        };

        return new RiskAssessment
        {
            VolatilityCategory = volCategory,
            SharpeCategory = sharpeCategory,
            DrawdownCategory = drawdownCategory,
            RiskScore = riskScore,
            OverallAssessment = overallAssessment,
            RiskWarnings = warnings,
            PositiveFactors = positives
        };
    }

    private decimal CalculateRiskScore(RiskMetricsResult metrics)
    {
        var volScore = Math.Max(0, 10 - (metrics.AnnualizedVolatility * 50)); // Lower vol = higher score
        var sharpeScore = Math.Min(10, Math.Max(0, metrics.SharpeRatio * 5)); // Higher Sharpe = higher score
        var drawdownScore = Math.Max(0, 10 - (metrics.MaximumDrawdown * 50)); // Lower drawdown = higher score

        return Math.Max(1, Math.Min(10, (volScore + sharpeScore + drawdownScore) / 3));
    }

    private string DetermineRiskProfile(RiskMetricsResult metrics)
    {
        if (metrics.AnnualizedVolatility < 0.08m && metrics.MaximumDrawdown < 0.10m)
            return "Conservative";

        if (metrics.AnnualizedVolatility < 0.15m && metrics.MaximumDrawdown < 0.20m)
            return "Moderate";

        return "Aggressive";
    }

    private RiskMetricsAnalysisResult CreateEmptyResult(CalculateRiskMetricsQuery request, string accountName)
    {
        return new RiskMetricsAnalysisResult
        {
            AccountId = request.AccountId,
            AccountName = accountName,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Days = (request.EndDate - request.StartDate).Days,
            RiskFreeRate = request.RiskFreeRate ?? 0.02m,
            RiskProfile = "Unknown",
            RiskAssessment = new RiskAssessment
            {
                OverallAssessment = "Insufficient data for risk analysis",
                RiskWarnings = new[] { "Not enough historical data to calculate reliable risk metrics" }
            }
        };
    }
}
