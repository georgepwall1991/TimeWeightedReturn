using MediatR;

namespace Application.Features.Client.Queries.GetClient;

public record GetClientQuery(Guid? Id = null) : IRequest<GetClientResponse>;

public record GetClientResponse(List<ClientDto> Clients);

public record ClientDto(
    Guid Id,
    string Name,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int PortfolioCount
);
