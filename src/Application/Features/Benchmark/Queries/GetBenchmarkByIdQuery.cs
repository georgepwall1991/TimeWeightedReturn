using Application.Features.Benchmark.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Queries;

public record GetBenchmarkByIdQuery(Guid Id) : IRequest<BenchmarkDto?>;

public class GetBenchmarkByIdQueryHandler : IRequestHandler<GetBenchmarkByIdQuery, BenchmarkDto?>
{
    private readonly IBenchmarkRepository _repository;

    public GetBenchmarkByIdQueryHandler(IBenchmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<BenchmarkDto?> Handle(GetBenchmarkByIdQuery request, CancellationToken cancellationToken)
    {
        var benchmark = await _repository.GetBenchmarkByIdAsync(request.Id);
        if (benchmark == null)
            return null;

        return new BenchmarkDto
        {
            Id = benchmark.Id,
            Name = benchmark.Name,
            IndexSymbol = benchmark.IndexSymbol,
            Description = benchmark.Description,
            Currency = benchmark.Currency,
            IsActive = benchmark.IsActive,
            CreatedAt = benchmark.CreatedAt,
            UpdatedAt = benchmark.UpdatedAt
        };
    }
}
