using Application.Interfaces;
using MediatR;

namespace Application.Features.Client.Commands.UpdateClient;

public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommand, UpdateClientResponse>
{
    private readonly IClientRepository _clientRepository;

    public UpdateClientCommandHandler(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<UpdateClientResponse> Handle(UpdateClientCommand request, CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetClientByIdAsync(request.Id, cancellationToken);

        if (client == null)
        {
            throw new KeyNotFoundException($"Client with ID {request.Id} not found");
        }

        // Check if another client with same name already exists
        var existingClient = await _clientRepository.GetClientByNameAsync(request.Name, cancellationToken);

        if (existingClient != null && existingClient.Id != request.Id)
        {
            throw new InvalidOperationException($"Another client with the name '{request.Name}' already exists");
        }

        client.Name = request.Name;
        client.UpdatedAt = DateTime.UtcNow;

        await _clientRepository.UpdateClientAsync(client, cancellationToken);

        return new UpdateClientResponse(
            client.Id,
            client.Name,
            client.UpdatedAt
        );
    }
}
