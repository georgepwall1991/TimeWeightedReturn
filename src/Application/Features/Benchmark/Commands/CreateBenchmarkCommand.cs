using Application.Features.Benchmark.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Commands;

public record CreateBenchmarkCommand(
    string Name,
    string IndexSymbol,
    string? Description,
    string Currency = "USD"
) : IRequest<BenchmarkDto>;

public class CreateBenchmarkCommandHandler : IRequestHandler<CreateBenchmarkCommand, BenchmarkDto>
{
    private readonly IBenchmarkRepository _repository;

    public CreateBenchmarkCommandHandler(IBenchmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<BenchmarkDto> Handle(CreateBenchmarkCommand request, CancellationToken cancellationToken)
    {
        var benchmark = new Domain.Entities.Benchmark
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            IndexSymbol = request.IndexSymbol,
            Description = request.Description,
            Currency = request.Currency,
            IsActive = true
        };

        var created = await _repository.CreateBenchmarkAsync(benchmark);

        return new BenchmarkDto
        {
            Id = created.Id,
            Name = created.Name,
            IndexSymbol = created.IndexSymbol,
            Description = created.Description,
            Currency = created.Currency,
            IsActive = created.IsActive,
            CreatedAt = created.CreatedAt,
            UpdatedAt = created.UpdatedAt
        };
    }
}
