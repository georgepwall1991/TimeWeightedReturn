using Application.Features.Instrument.DTOs;
using MediatR;

namespace Application.Features.Instrument.Queries.GetInstrumentById;

public record GetInstrumentByIdQuery(Guid InstrumentId) : IRequest<InstrumentDto?>;
