using Application.Interfaces;
using MediatR;

namespace Application.Features.Client.Commands.CreateClient;

public class CreateClientCommandHandler : IRequestHandler<CreateClientCommand, CreateClientResponse>
{
    private readonly IClientRepository _clientRepository;

    public CreateClientCommandHandler(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<CreateClientResponse> Handle(CreateClientCommand request, CancellationToken cancellationToken)
    {
        // Check if client with same name already exists
        var existingClient = await _clientRepository.GetClientByNameAsync(request.Name, cancellationToken);

        if (existingClient != null)
        {
            throw new InvalidOperationException($"A client with the name '{request.Name}' already exists");
        }

        var client = new Domain.Entities.Client
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _clientRepository.CreateClientAsync(client, cancellationToken);

        return new CreateClientResponse(
            client.Id,
            client.Name,
            client.CreatedAt
        );
    }
}
