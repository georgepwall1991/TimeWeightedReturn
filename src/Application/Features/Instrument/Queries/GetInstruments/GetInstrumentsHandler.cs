using Application.Features.Instrument.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Instrument.Queries.GetInstruments;

public class GetInstrumentsHandler : IRequestHandler<GetInstrumentsQuery, List<InstrumentDto>>
{
    private readonly IInstrumentRepository _repository;

    public GetInstrumentsHandler(IInstrumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<InstrumentDto>> Handle(GetInstrumentsQuery request, CancellationToken cancellationToken)
    {
        var instruments = await _repository.GetAllInstrumentsAsync();

        return instruments.Select(i => new InstrumentDto(
            i.Id,
            i.Ticker,
            i.Name,
            i.Currency,
            i.Type,
            i.Isin,
            i.Sedol,
            i.Cusip,
            i.AssetClass,
            i.Sector,
            i.Exchange,
            i.Country,
            i.PreferredDataProvider,
            i.DataProviderConfig,
            i.CreatedAt,
            i.UpdatedAt)).ToList();
    }
}
