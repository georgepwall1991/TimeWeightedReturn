using Application.Features.Instrument.DTOs;
using Application.Interfaces;
using MediatR;

namespace Application.Features.Instrument.Commands.UpdateInstrument;

public class UpdateInstrumentHandler : IRequestHandler<UpdateInstrumentCommand, InstrumentDto>
{
    private readonly IInstrumentRepository _repository;

    public UpdateInstrumentHandler(IInstrumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<InstrumentDto> Handle(UpdateInstrumentCommand request, CancellationToken cancellationToken)
    {
        var instrument = await _repository.GetInstrumentByIdAsync(request.InstrumentId);

        if (instrument == null)
        {
            throw new InvalidOperationException($"Instrument with ID '{request.InstrumentId}' not found");
        }

        var req = request.Request;

        // Check if ticker is being changed and if it conflicts with another instrument
        if (instrument.Ticker != req.Ticker)
        {
            var existingInstrument = await _repository.GetInstrumentByTickerAsync(req.Ticker);

            if (existingInstrument != null && existingInstrument.Id != request.InstrumentId)
            {
                throw new InvalidOperationException($"An instrument with ticker '{req.Ticker}' already exists");
            }
        }

        instrument.Ticker = req.Ticker;
        instrument.Name = req.Name;
        instrument.Currency = req.Currency;
        instrument.Type = req.Type;
        instrument.Isin = req.Isin;
        instrument.Sedol = req.Sedol;
        instrument.Cusip = req.Cusip;
        instrument.AssetClass = req.AssetClass;
        instrument.Sector = req.Sector;
        instrument.Exchange = req.Exchange;
        instrument.Country = req.Country;
        instrument.PreferredDataProvider = req.PreferredDataProvider;
        instrument.DataProviderConfig = req.DataProviderConfig;
        instrument.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateInstrumentAsync(instrument);

        return MapToDto(updated);
    }

    private static InstrumentDto MapToDto(Domain.Entities.Instrument instrument) => new(
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
