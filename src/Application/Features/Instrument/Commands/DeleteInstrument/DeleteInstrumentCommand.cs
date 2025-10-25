using MediatR;

namespace Application.Features.Instrument.Commands.DeleteInstrument;

public record DeleteInstrumentCommand(Guid InstrumentId) : IRequest<bool>;
