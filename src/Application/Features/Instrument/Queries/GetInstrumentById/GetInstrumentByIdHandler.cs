using Application.Features.Instrument.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Instrument.Queries.GetInstrumentById;

public class GetInstrumentByIdHandler : IRequestHandler<GetInstrumentByIdQuery, InstrumentDto?>
{
    private readonly IInstrumentRepository _repository;

    public GetInstrumentByIdHandler(IInstrumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<InstrumentDto?> Handle(GetInstrumentByIdQuery request, CancellationToken cancellationToken)
    {
        var instrument = await _repository.GetInstrumentByIdAsync(request.InstrumentId);

        if (instrument == null)
        {
            return null;
        }

        return new InstrumentDto(
            instrument.Id,
            instrument.Ticker,
            instrument.Name,
            instrument.Currency,
            instrument.Type,
            instrument.Isin,
            instrument.Sedol,
            instrument.Cusip,
            instrument.AssetClass,
            instrument.Sector,
            instrument.Exchange,
            instrument.Country,
            instrument.PreferredDataProvider,
            instrument.DataProviderConfig,
            instrument.CreatedAt,
            instrument.UpdatedAt);
    }
}
