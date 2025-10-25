using Application.Features.DataHealth.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.DataHealth.Queries;

public record GetOverallHealthQuery : IRequest<DataHealthSummary>;

public class GetOverallHealthQueryHandler : IRequestHandler<GetOverallHealthQuery, DataHealthSummary>
{
    private readonly IDataHealthService _dataHealthService;

    public GetOverallHealthQueryHandler(IDataHealthService dataHealthService)
    {
        _dataHealthService = dataHealthService;
    }

    public async Task<DataHealthSummary> Handle(GetOverallHealthQuery request, CancellationToken cancellationToken)
    {
        return await _dataHealthService.GetOverallHealthAsync(cancellationToken);
    }
}
