using Application.Features.CashFlow.Commands.CreateCashFlow;
using Application.Interfaces;
using Domain.Entities;
using Moq;

namespace Application.Tests.Handlers;

public class CreateCashFlowCommandHandlerTests
{
    private readonly Mock<ICashFlowRepository> _mockCashFlowRepository;
    private readonly CreateCashFlowCommandHandler _handler;

    public CreateCashFlowCommandHandlerTests()
    {
        _mockCashFlowRepository = new Mock<ICashFlowRepository>();
        _handler = new CreateCashFlowCommandHandler(_mockCashFlowRepository.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CreatesCashFlow()
    {
        // Arrange
        var accountId = Guid.NewGuid();
        var date = new DateOnly(2024, 1, 15);
        var amount = 10000m;
        var description = "Initial deposit";
        var type = CashFlowType.ClientContribution;
        var category = CashFlowCategory.ExternalFlow;
        var transactionRef = "TXN-001";

        var command = new CreateCashFlowCommand(
            accountId,
            date,
            amount,
            description,
            type,
            category,
            transactionRef);

        _mockCashFlowRepository
            .Setup(r => r.AccountExistsAsync(accountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var createdCashFlow = new CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Date = date,
            Amount = amount,
            Description = description,
            Type = type,
            Category = category,
            TransactionReference = transactionRef,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockCashFlowRepository
            .Setup(r => r.CreateCashFlowAsync(It.IsAny<CashFlow>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdCashFlow);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(accountId, result.AccountId);
        Assert.Equal(date, result.Date);
        Assert.Equal(amount, result.Amount);
        Assert.Equal(description, result.Description);
        Assert.Equal(type, result.Type);
        Assert.Equal(category, result.Category);
        Assert.Equal(transactionRef, result.TransactionReference);

        _mockCashFlowRepository.Verify(
            r => r.CreateCashFlowAsync(It.Is<CashFlow>(cf =>
                cf.AccountId == accountId &&
                cf.Date == date &&
                cf.Amount == amount &&
                cf.Description == description &&
                cf.Type == type &&
                cf.Category == category &&
                cf.TransactionReference == transactionRef
            ), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentAccount_ThrowsKeyNotFoundException()
    {
        // Arrange
        var accountId = Guid.NewGuid();
        var command = new CreateCashFlowCommand(
            accountId,
            new DateOnly(2024, 1, 15),
            10000m,
            "Test deposit",
            CashFlowType.ClientContribution,
            CashFlowCategory.ExternalFlow);

        _mockCashFlowRepository
            .Setup(r => r.AccountExistsAsync(accountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(
            async () => await _handler.Handle(command, CancellationToken.None));

        _mockCashFlowRepository.Verify(
            r => r.CreateCashFlowAsync(It.IsAny<CashFlow>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithWithdrawal_CreatesNegativeAmountCashFlow()
    {
        // Arrange
        var accountId = Guid.NewGuid();
        var amount = -5000m; // Withdrawal
        var command = new CreateCashFlowCommand(
            accountId,
            new DateOnly(2024, 2, 1),
            amount,
            "Client withdrawal",
            CashFlowType.ClientWithdrawal,
            CashFlowCategory.ExternalFlow);

        _mockCashFlowRepository
            .Setup(r => r.AccountExistsAsync(accountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var createdCashFlow = new CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Amount = amount,
            Type = CashFlowType.ClientWithdrawal,
            CreatedAt = DateTime.UtcNow
        };

        _mockCashFlowRepository
            .Setup(r => r.CreateCashFlowAsync(It.IsAny<CashFlow>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdCashFlow);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(amount, result.Amount);
        Assert.Equal(CashFlowType.ClientWithdrawal, result.Type);
    }

    [Fact]
    public async Task Handle_WithPerformanceInfluencingCategory_CreatesCorrectly()
    {
        // Arrange
        var accountId = Guid.NewGuid();
        var command = new CreateCashFlowCommand(
            accountId,
            new DateOnly(2024, 3, 1),
            250m,
            "Dividend payment",
            CashFlowType.Dividend,
            CashFlowCategory.PerformanceInfluencing); // Performance-influencing cash flow

        _mockCashFlowRepository
            .Setup(r => r.AccountExistsAsync(accountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var createdCashFlow = new CashFlow
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Category = CashFlowCategory.PerformanceInfluencing,
            CreatedAt = DateTime.UtcNow
        };

        _mockCashFlowRepository
            .Setup(r => r.CreateCashFlowAsync(It.IsAny<CashFlow>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdCashFlow);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(CashFlowCategory.PerformanceInfluencing, result.Category);
    }
}
