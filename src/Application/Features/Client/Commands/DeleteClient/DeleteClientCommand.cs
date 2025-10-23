using MediatR;

namespace Application.Features.Client.Commands.DeleteClient;

public record DeleteClientCommand(Guid Id) : IRequest<DeleteClientResponse>;

public record DeleteClientResponse(bool Success, string Message);
