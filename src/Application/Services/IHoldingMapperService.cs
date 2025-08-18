using System.Collections.Generic;
using System.Threading.Tasks;
using Domain.Entities;
using Application.Features.Portfolio.DTOs;
using System;

namespace Application.Services
{
    public interface IHoldingMapperService
    {
        Task<List<HoldingDto>> MapHoldingsToDtosAsync(IEnumerable<Holding> holdings, DateOnly date);
    }
}
