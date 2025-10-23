using Application.Interfaces;
using MediatR;

namespace Application.Features.Client.Queries.GetClient;

public class GetClientQueryHandler : IRequestHandler<GetClientQuery, GetClientResponse>
{
    private readonly IClientRepository _clientRepository;

    public GetClientQueryHandler(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<GetClientResponse> Handle(GetClientQuery request, CancellationToken cancellationToken)
    {
        List<Domain.Entities.Client> clients;

        if (request.Id.HasValue)
        {
            var client = await _clientRepository.GetClientByIdAsync(request.Id.Value, cancellationToken);
            clients = client != null ? new List<Domain.Entities.Client> { client } : new List<Domain.Entities.Client>();
        }
        else
        {
            clients = await _clientRepository.GetAllClientsAsync(cancellationToken);
        }

        var clientDtos = clients.Select(c => new ClientDto(
            c.Id,
            c.Name,
            c.CreatedAt,
            c.UpdatedAt,
            c.Portfolios.Count
        )).ToList();

        return new GetClientResponse(clientDtos);
    }
}
