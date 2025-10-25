using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class InstrumentRepository : IInstrumentRepository
{
    private readonly PortfolioContext _context;

    public InstrumentRepository(PortfolioContext context)
    {
        _context = context;
    }

    public async Task<List<Instrument>> GetAllInstrumentsAsync()
    {
        return await _context.Instruments
            .OrderBy(i => i.Ticker)
            .ToListAsync();
    }

    public async Task<Instrument?> GetInstrumentByIdAsync(Guid id)
    {
        return await _context.Instruments
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<Instrument?> GetInstrumentByTickerAsync(string ticker)
    {
        return await _context.Instruments
            .FirstOrDefaultAsync(i => i.Ticker == ticker);
    }

    public async Task<Instrument> CreateInstrumentAsync(Instrument instrument)
    {
        _context.Instruments.Add(instrument);
        await _context.SaveChangesAsync();
        return instrument;
    }

    public async Task<Instrument> UpdateInstrumentAsync(Instrument instrument)
    {
        _context.Instruments.Update(instrument);
        await _context.SaveChangesAsync();
        return instrument;
    }

    public async Task<bool> DeleteInstrumentAsync(Guid id)
    {
        var instrument = await _context.Instruments
            .Include(i => i.Holdings)
            .Include(i => i.Prices)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (instrument == null)
            return false;

        // Check if instrument has holdings
        if (instrument.Holdings.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete instrument '{instrument.Ticker}' as it is currently used in {instrument.Holdings.Count} holding(s)");
        }

        // Delete associated prices first
        _context.Prices.RemoveRange(instrument.Prices);

        // Delete the instrument
        _context.Instruments.Remove(instrument);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> InstrumentHasHoldingsAsync(Guid id)
    {
        return await _context.Holdings.AnyAsync(h => h.InstrumentId == id);
    }
}
