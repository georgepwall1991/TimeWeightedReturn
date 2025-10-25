using Application.Features.Instrument.DTOs;
using Application.Interfaces;
using Domain.Entities;
using MediatR;

namespace Application.Features.Instrument.Commands.CreateInstrument;

public class CreateInstrumentHandler : IRequestHandler<CreateInstrumentCommand, InstrumentDto>
{
    private readonly IInstrumentRepository _repository;

    public CreateInstrumentHandler(IInstrumentRepository repository)
    {
        _repository = repository;
    }

    public async Task<InstrumentDto> Handle(CreateInstrumentCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        // Check if ticker already exists
        var existingInstrument = await _repository.GetInstrumentByTickerAsync(req.Ticker);

        if (existingInstrument != null)
        {
            throw new InvalidOperationException($"An instrument with ticker '{req.Ticker}' already exists");
        }

        var instrument = new Domain.Entities.Instrument
        {
            Id = Guid.NewGuid(),
            Ticker = req.Ticker,
            Name = req.Name,
            Currency = req.Currency,
            Type = req.Type,
            Isin = req.Isin,
            Sedol = req.Sedol,
            Cusip = req.Cusip,
            AssetClass = req.AssetClass,
            Sector = req.Sector,
            Exchange = req.Exchange,
            Country = req.Country,
            PreferredDataProvider = req.PreferredDataProvider,
            DataProviderConfig = req.DataProviderConfig,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.CreateInstrumentAsync(instrument);

        return MapToDto(created);
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
