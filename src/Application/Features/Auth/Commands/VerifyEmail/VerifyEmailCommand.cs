using MediatR;

namespace Application.Features.Auth.Commands.VerifyEmail;

public record VerifyEmailCommand(string Token) : IRequest<VerifyEmailResult>;

public record VerifyEmailResult(bool Success, string Message);
