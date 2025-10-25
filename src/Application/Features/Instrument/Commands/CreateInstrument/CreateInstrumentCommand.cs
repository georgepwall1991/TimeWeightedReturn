using Application.Features.Instrument.DTOs;
using MediatR;

namespace Application.Features.Instrument.Commands.CreateInstrument;

public record CreateInstrumentCommand(CreateInstrumentRequest Request) : IRequest<InstrumentDto>;
