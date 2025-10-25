using Application.Features.DataHealth.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.DataHealth.Queries;

public record GetAllHealthIssuesQuery(HealthSeverity? MinimumSeverity = null) : IRequest<IEnumerable<DataHealthDetail>>;

public class GetAllHealthIssuesQueryHandler : IRequestHandler<GetAllHealthIssuesQuery, IEnumerable<DataHealthDetail>>
{
    private readonly IDataHealthService _dataHealthService;

    public GetAllHealthIssuesQueryHandler(IDataHealthService dataHealthService)
    {
        _dataHealthService = dataHealthService;
    }

    public async Task<IEnumerable<DataHealthDetail>> Handle(GetAllHealthIssuesQuery request, CancellationToken cancellationToken)
    {
        return await _dataHealthService.GetAllHealthIssuesAsync(request.MinimumSeverity, cancellationToken);
    }
}
