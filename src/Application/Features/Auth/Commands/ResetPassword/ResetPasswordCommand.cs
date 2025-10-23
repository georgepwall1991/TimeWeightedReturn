using MediatR;

namespace Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(string Token, string NewPassword) : IRequest<ResetPasswordResult>;

public record ResetPasswordResult(bool Success, string Message);
