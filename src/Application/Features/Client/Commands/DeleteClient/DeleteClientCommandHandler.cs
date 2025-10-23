using Application.Interfaces;
using MediatR;

namespace Application.Features.Client.Commands.DeleteClient;

public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand, DeleteClientResponse>
{
    private readonly IClientRepository _clientRepository;

    public DeleteClientCommandHandler(IClientRepository clientRepository)
    {
        _clientRepository = clientRepository;
    }

    public async Task<DeleteClientResponse> Handle(DeleteClientCommand request, CancellationToken cancellationToken)
    {
        var client = await _clientRepository.GetClientByIdAsync(request.Id, cancellationToken);

        if (client == null)
        {
            throw new KeyNotFoundException($"Client with ID {request.Id} not found");
        }

        // Check if client has any portfolios
        if (client.Portfolios.Any())
        {
            throw new InvalidOperationException(
                $"Cannot delete client '{client.Name}' because it has {client.Portfolios.Count} portfolio(s). " +
                "Please delete all portfolios first.");
        }

        await _clientRepository.DeleteClientAsync(client, cancellationToken);

        return new DeleteClientResponse(true, $"Client '{client.Name}' deleted successfully");
    }
}
