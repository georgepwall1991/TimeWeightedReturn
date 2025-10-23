using Application.Features.Benchmark.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Commands;

public record UpdateBenchmarkCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive
) : IRequest<BenchmarkDto>;

public class UpdateBenchmarkCommandHandler : IRequestHandler<UpdateBenchmarkCommand, BenchmarkDto>
{
    private readonly IBenchmarkRepository _repository;

    public UpdateBenchmarkCommandHandler(IBenchmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<BenchmarkDto> Handle(UpdateBenchmarkCommand request, CancellationToken cancellationToken)
    {
        var benchmark = await _repository.GetBenchmarkByIdAsync(request.Id);
        if (benchmark == null)
            throw new KeyNotFoundException($"Benchmark with ID {request.Id} not found");

        benchmark.Name = request.Name;
        benchmark.Description = request.Description;
        benchmark.IsActive = request.IsActive;

        var updated = await _repository.UpdateBenchmarkAsync(benchmark);

        return new BenchmarkDto
        {
            Id = updated.Id,
            Name = updated.Name,
            IndexSymbol = updated.IndexSymbol,
            Description = updated.Description,
            Currency = updated.Currency,
            IsActive = updated.IsActive,
            CreatedAt = updated.CreatedAt,
            UpdatedAt = updated.UpdatedAt
        };
    }
}
