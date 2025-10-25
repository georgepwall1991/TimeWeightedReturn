using Application.Interfaces;
using MediatR;

namespace Application.Features.Instrument.Commands.DeleteInstrument;

public class DeleteInstrumentHandler : IRequestHandler<DeleteInstrumentCommand, bool>
{
    private readonly IInstrumentRepository _repository;

    public DeleteInstrumentHandler(IInstrumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteInstrumentCommand request, CancellationToken cancellationToken)
    {
        return await _repository.DeleteInstrumentAsync(request.InstrumentId);
    }
}
