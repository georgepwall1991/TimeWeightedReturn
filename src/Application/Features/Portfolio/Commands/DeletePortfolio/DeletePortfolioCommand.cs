using MediatR;

namespace Application.Features.Portfolio.Commands.DeletePortfolio;

public record DeletePortfolioCommand(Guid Id) : IRequest<DeletePortfolioResponse>;

public record DeletePortfolioResponse(bool Success, string Message);
