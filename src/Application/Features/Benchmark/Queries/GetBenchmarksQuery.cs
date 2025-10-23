using Application.Features.Benchmark.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Queries;

public record GetBenchmarksQuery : IRequest<List<BenchmarkDto>>;

public class GetBenchmarksQueryHandler : IRequestHandler<GetBenchmarksQuery, List<BenchmarkDto>>
{
    private readonly IBenchmarkRepository _repository;

    public GetBenchmarksQueryHandler(IBenchmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BenchmarkDto>> Handle(GetBenchmarksQuery request, CancellationToken cancellationToken)
    {
        var benchmarks = await _repository.GetAllBenchmarksAsync();

        return benchmarks.Select(b => new BenchmarkDto
        {
            Id = b.Id,
            Name = b.Name,
            IndexSymbol = b.IndexSymbol,
            Description = b.Description,
            Currency = b.Currency,
            IsActive = b.IsActive,
            CreatedAt = b.CreatedAt,
            UpdatedAt = b.UpdatedAt
        }).ToList();
    }
}
