using MediatR;

namespace Application.Features.Account.Commands.DeleteAccount;

public record DeleteAccountCommand(Guid Id) : IRequest<DeleteAccountResponse>;

public record DeleteAccountResponse(bool Success, string Message);
