using Domain.Entities;

namespace Application.Interfaces;

public interface IInstrumentRepository
{
    Task<List<Instrument>> GetAllInstrumentsAsync();
    Task<Instrument?> GetInstrumentByIdAsync(Guid id);
    Task<Instrument?> GetInstrumentByTickerAsync(string ticker);
    Task<Instrument> CreateInstrumentAsync(Instrument instrument);
    Task<Instrument> UpdateInstrumentAsync(Instrument instrument);
    Task<bool> DeleteInstrumentAsync(Guid id);
    Task<bool> InstrumentHasHoldingsAsync(Guid id);
}
