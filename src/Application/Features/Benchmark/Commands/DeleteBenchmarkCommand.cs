using Application.Interfaces;
using MediatR;

namespace Application.Features.Benchmark.Commands;

public record DeleteBenchmarkCommand(Guid Id) : IRequest<bool>;

public class DeleteBenchmarkCommandHandler : IRequestHandler<DeleteBenchmarkCommand, bool>
{
    private readonly IBenchmarkRepository _repository;

    public DeleteBenchmarkCommandHandler(IBenchmarkRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteBenchmarkCommand request, CancellationToken cancellationToken)
    {
        var benchmark = await _repository.GetBenchmarkByIdAsync(request.Id);
        if (benchmark == null)
            return false;

        await _repository.DeleteBenchmarkAsync(request.Id);
        return true;
    }
}
