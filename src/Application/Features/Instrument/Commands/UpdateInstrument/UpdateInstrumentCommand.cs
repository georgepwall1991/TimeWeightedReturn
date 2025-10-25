using Application.Features.Instrument.DTOs;
using MediatR;

namespace Application.Features.Instrument.Commands.UpdateInstrument;

public record UpdateInstrumentCommand(Guid InstrumentId, UpdateInstrumentRequest Request) : IRequest<InstrumentDto>;
