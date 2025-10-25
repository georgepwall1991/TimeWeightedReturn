using Application.Features.Instrument.DTOs;
using MediatR;

namespace Application.Features.Instrument.Queries.GetInstruments;

public record GetInstrumentsQuery : IRequest<List<InstrumentDto>>;
