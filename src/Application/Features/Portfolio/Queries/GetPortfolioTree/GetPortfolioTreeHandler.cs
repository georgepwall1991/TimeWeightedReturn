using Domain.Interfaces;
using Application.Features.Portfolio.DTOs;
using Domain.Services;
using Domain.ValueObjects;
using MediatR;

namespace Application.Features.Portfolio.Queries.GetPortfolioTree;

public class GetPortfolioTreeHandler : IRequestHandler<GetPortfolioTreeQuery, PortfolioTreeResponse>
{
    private readonly IPortfolioRepository _repository;
    private readonly TimeWeightedReturnService _twrService;

    public GetPortfolioTreeHandler(IPortfolioRepository repository, TimeWeightedReturnService twrService)
    {
        _repository = repository;
        _twrService = twrService;
    }

    public async Task<PortfolioTreeResponse> Handle(GetPortfolioTreeQuery request, CancellationToken cancellationToken)
    {
        var date = request.Date ?? DateOnly.FromDateTime(DateTime.Today);
        var clients = await _repository.GetClientsWithPortfoliosAsync(request.ClientId, request.UserId);

        var clientNodes = new List<ClientNodeDto>();
        var totalValueAcrossAllClients = 0m;

        foreach (var client in clients)
        {
            var portfolios = new List<PortfolioNodeDto>();

            decimal clientTotalValue = 0;
            var clientTotalHoldings = 0;

            foreach (var portfolio in client.Portfolios)
            {
                var accounts = new List<AccountNodeDto>();

                decimal portfolioTotalValue = 0;
                var portfolioTotalHoldings = 0;

                foreach (var account in portfolio.Accounts)
                {
                    var accountValue = await _repository.GetAccountValueAsync(account.Id, date);
                    var holdingCount = await _repository.GetHoldingCountAsync(account.Id, date);

                    var accountNode = new AccountNodeDto
                    {
                        Id = account.Id,
                        Name = account.Name,
                        AccountNumber = account.AccountNumber,
                        Currency = account.Currency,
                        PortfolioId = portfolio.Id,
                        TotalValueGBP = accountValue,
                        HoldingsCount = holdingCount,
                        Metrics = request.MetricsStartDate.HasValue && request.MetricsEndDate.HasValue
                            ? await CalculateAccountMetrics(account.Id, request.MetricsStartDate.Value,
                                request.MetricsEndDate.Value)
                            : null
                    };

                    accounts.Add(accountNode);
                    portfolioTotalValue += accountValue;
                    portfolioTotalHoldings += holdingCount;
                }

                var portfolioNode = new PortfolioNodeDto
                {
                    Id = portfolio.Id,
                    Name = portfolio.Name,
                    ClientId = client.Id,
                    Accounts = accounts,
                    TotalValueGBP = portfolioTotalValue,
                    HoldingsCount = portfolioTotalHoldings,
                    Metrics = request.MetricsStartDate.HasValue && request.MetricsEndDate.HasValue
                        ? await CalculatePortfolioMetrics(portfolio.Id, request.MetricsStartDate.Value,
                            request.MetricsEndDate.Value)
                        : null
                };

                portfolios.Add(portfolioNode);
                clientTotalValue += portfolioTotalValue;
                clientTotalHoldings += portfolioTotalHoldings;
            }

            var clientNode = new ClientNodeDto
            {
                Id = client.Id,
                Name = client.Name,
                Portfolios = portfolios,
                TotalValueGBP = clientTotalValue,
                HoldingsCount = clientTotalHoldings,
                Metrics = request.MetricsStartDate.HasValue && request.MetricsEndDate.HasValue
                    ? await CalculateClientMetrics(client.Id, request.MetricsStartDate.Value,
                        request.MetricsEndDate.Value)
                    : null
            };

            clientNodes.Add(clientNode);
            totalValueAcrossAllClients += clientTotalValue;
        }

        return new PortfolioTreeResponse(
            clientNodes,
            totalValueAcrossAllClients,
            DateTime.UtcNow
        );
    }

    private async Task<PerformanceMetricsDto?> CalculateAccountMetrics(Guid accountId, DateOnly startDate,
        DateOnly endDate)
    {
        try
        {
            var holdingDates = await _repository.GetHoldingDatesInRangeAsync(accountId, startDate, endDate);

            if (!holdingDates.Any())
                return null;

            var allDates = holdingDates.ToList();
            if (!allDates.Contains(startDate)) allDates.Insert(0, startDate);
            if (!allDates.Contains(endDate)) allDates.Add(endDate);
            allDates = allDates.Distinct().OrderBy(d => d).ToList();

            var subPeriods = new List<SubPeriod>();
            for (var i = 0; i < allDates.Count - 1; i++)
            {
                var periodStart = allDates[i];
                var periodEnd = allDates[i + 1];

                var startValue = await _repository.GetAccountValueAsync(accountId, periodStart);
                var endValue = await _repository.GetAccountValueAsync(accountId, periodEnd);

                if (startValue > 0) subPeriods.Add(new SubPeriod(startValue, endValue, 0m)); // No flows for now
            }

            if (!subPeriods.Any())
                return null;

            var twr = _twrService.Calculate(subPeriods);
            var dateRange = new DateRange(startDate, endDate);
            var annualized = _twrService.AnnualizeReturn(twr, dateRange.Days);

            return new PerformanceMetricsDto
            {
                TimeWeightedReturn = twr,
                AnnualizedReturn = annualized,
                StartDate = startDate,
                EndDate = endDate,
                Days = dateRange.Days
            };
        }
        catch
        {
            return null; // If calculation fails, return null metrics
        }
    }

    private async Task<PerformanceMetricsDto?> CalculatePortfolioMetrics(Guid portfolioId, DateOnly startDate,
        DateOnly endDate)
    {
        try
        {
            var accounts = await _repository.GetAccountsAsync(portfolioId);

            if (!accounts.Any())
                return null;

            var totalStartValue = 0m;
            var totalEndValue = 0m;

            foreach (var account in accounts)
            {
                var startValue = await _repository.GetAccountValueAsync(account.Id, startDate);
                var endValue = await _repository.GetAccountValueAsync(account.Id, endDate);

                totalStartValue += startValue;
                totalEndValue += endValue;
            }

            if (totalStartValue <= 0)
                return null;

            var portfolioReturn = (totalEndValue - totalStartValue) / totalStartValue;
            var dateRange = new DateRange(startDate, endDate);
            var annualized = _twrService.AnnualizeReturn(portfolioReturn, dateRange.Days);

            return new PerformanceMetricsDto
            {
                TimeWeightedReturn = portfolioReturn,
                AnnualizedReturn = annualized,
                StartDate = startDate,
                EndDate = endDate,
                Days = dateRange.Days
            };
        }
        catch
        {
            return null;
        }
    }

    private async Task<PerformanceMetricsDto?> CalculateClientMetrics(Guid clientId, DateOnly startDate,
        DateOnly endDate)
    {
        try
        {
            var portfolios = await _repository.GetPortfoliosWithAccountsAsync(clientId);

            if (!portfolios.Any())
                return null;

            var totalStartValue = 0m;
            var totalEndValue = 0m;

            foreach (var portfolio in portfolios)
            {
                var accounts = await _repository.GetAccountsAsync(portfolio.Id);
                foreach (var account in accounts)
                {
                    var startValue = await _repository.GetAccountValueAsync(account.Id, startDate);
                    var endValue = await _repository.GetAccountValueAsync(account.Id, endDate);

                    totalStartValue += startValue;
                    totalEndValue += endValue;
                }
            }

            if (totalStartValue <= 0)
                return null;

            var clientReturn = (totalEndValue - totalStartValue) / totalStartValue;
            var dateRange = new DateRange(startDate, endDate);
            var annualized = _twrService.AnnualizeReturn(clientReturn, dateRange.Days);

            return new PerformanceMetricsDto
            {
                TimeWeightedReturn = clientReturn,
                AnnualizedReturn = annualized,
                StartDate = startDate,
                EndDate = endDate,
                Days = dateRange.Days
            };
        }
        catch
        {
            return null;
        }
    }
}
