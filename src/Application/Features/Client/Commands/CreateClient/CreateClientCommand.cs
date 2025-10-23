using MediatR;

namespace Application.Features.Client.Commands.CreateClient;

public record CreateClientCommand(string Name) : IRequest<CreateClientResponse>;

public record CreateClientResponse(
    Guid Id,
    string Name,
    DateTime CreatedAt
);
