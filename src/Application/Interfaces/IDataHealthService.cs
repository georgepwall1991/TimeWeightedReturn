using Application.Features.DataHealth.DTOs;

namespace Application.Interfaces;

public interface IDataHealthService
{
    Task<DataHealthSummary> GetOverallHealthAsync(CancellationToken cancellationToken = default);

    Task<IEnumerable<DataHealthDetail>> GetPortfolioHealthDetailsAsync(
        Guid portfolioId,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<DataHealthDetail>> GetAccountHealthDetailsAsync(
        Guid accountId,
        CancellationToken cancellationToken = default);

    Task<IEnumerable<DataHealthDetail>> GetAllHealthIssuesAsync(
        HealthSeverity? minimumSeverity = null,
        CancellationToken cancellationToken = default);
}
