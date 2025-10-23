using MediatR;

namespace Application.Features.Client.Commands.UpdateClient;

public record UpdateClientCommand(Guid Id, string Name) : IRequest<UpdateClientResponse>;

public record UpdateClientResponse(
    Guid Id,
    string Name,
    DateTime UpdatedAt
);
