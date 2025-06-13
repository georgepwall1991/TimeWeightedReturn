using Application.Features.Common.Interfaces;
using Application.Features.Portfolio.Queries.GetPortfolioTree;
using Domain.Entities;
using Domain.Services;
using Moq;

namespace Application.Tests.Handlers;

public class GetPortfolioTreeHandlerTests
{
    private readonly GetPortfolioTreeHandler _handler;
    private readonly Mock<IPortfolioRepository> _mockRepository;
    private readonly Mock<TimeWeightedReturnService> _mockTwrService;

    public GetPortfolioTreeHandlerTests()
    {
        _mockRepository = new Mock<IPortfolioRepository>();
        _mockTwrService = new Mock<TimeWeightedReturnService>();
        _handler = new GetPortfolioTreeHandler(_mockRepository.Object, _mockTwrService.Object);
    }

    [Fact]
    public async Task Handle_WithValidClient_ReturnsHierarchicalStructure()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        var portfolioId = Guid.NewGuid();
        var accountId = Guid.NewGuid();
        var date = new DateOnly(2025, 6, 11);

        var client = new Client
        {
            Id = clientId,
            Name = "Test Client",
            Portfolios = new List<Portfolio>
            {
                new()
                {
                    Id = portfolioId,
                    Name = "Test Portfolio",
                    ClientId = clientId,
                    Accounts = new List<Account>
                    {
                        new()
                        {
                            Id = accountId,
                            Name = "Test Account",
                            AccountNumber = "ACC001",
                            PortfolioId = portfolioId
                        }
                    }
                }
            }
        };

        _mockRepository.Setup(r => r.GetClientsWithPortfoliosAsync(clientId))
            .ReturnsAsync(new[] { client });

        _mockRepository.Setup(r => r.GetAccountValueAsync(accountId, date))
            .ReturnsAsync(10000m);

        _mockRepository.Setup(r => r.GetHoldingCountAsync(accountId, date))
            .ReturnsAsync(5);

        var query = new GetPortfolioTreeQuery(clientId, date);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var clientNodes = result.Clients;
        Assert.Single(clientNodes);

        var clientNode = clientNodes.First();
        Assert.Equal(clientId, clientNode.Id);
        Assert.Equal("Test Client", clientNode.Name);
        Assert.Equal("Client", clientNode.NodeType);
        Assert.Equal(10000m, clientNode.TotalValueGBP);
        Assert.Equal(5, clientNode.HoldingsCount);

        Assert.Single(clientNode.Portfolios);
        var portfolioNode = clientNode.Portfolios.First();
        Assert.Equal(portfolioId, portfolioNode.Id);
        Assert.Equal("Test Portfolio", portfolioNode.Name);
        Assert.Equal("Portfolio", portfolioNode.NodeType);
        Assert.Equal(10000m, portfolioNode.TotalValueGBP);
        Assert.Equal(5, portfolioNode.HoldingsCount);

        Assert.Single(portfolioNode.Accounts);
        var accountNode = portfolioNode.Accounts.First();
        Assert.Equal(accountId, accountNode.Id);
        Assert.Equal("Test Account", accountNode.Name);
        Assert.Equal("Account", accountNode.NodeType);
        Assert.Equal("ACC001", accountNode.AccountNumber);
        Assert.Equal(10000m, accountNode.TotalValueGBP);
        Assert.Equal(5, accountNode.HoldingsCount);
    }

    [Fact]
    public async Task Handle_WithMultipleAccounts_AggregatesValuesCorrectly()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        var portfolioId = Guid.NewGuid();
        var account1Id = Guid.NewGuid();
        var account2Id = Guid.NewGuid();
        var date = new DateOnly(2025, 6, 11);

        var client = new Client
        {
            Id = clientId,
            Name = "Test Client",
            Portfolios = new List<Portfolio>
            {
                new()
                {
                    Id = portfolioId,
                    Name = "Test Portfolio",
                    ClientId = clientId,
                    Accounts = new List<Account>
                    {
                        new()
                        {
                            Id = account1Id, Name = "Account 1", AccountNumber = "ACC001", PortfolioId = portfolioId
                        },
                        new()
                        {
                            Id = account2Id, Name = "Account 2", AccountNumber = "ACC002", PortfolioId = portfolioId
                        }
                    }
                }
            }
        };

        _mockRepository.Setup(r => r.GetClientsWithPortfoliosAsync(clientId))
            .ReturnsAsync(new[] { client });

        _mockRepository.Setup(r => r.GetAccountValueAsync(account1Id, date))
            .ReturnsAsync(15000m);
        _mockRepository.Setup(r => r.GetAccountValueAsync(account2Id, date))
            .ReturnsAsync(25000m);

        _mockRepository.Setup(r => r.GetHoldingCountAsync(account1Id, date))
            .ReturnsAsync(3);
        _mockRepository.Setup(r => r.GetHoldingCountAsync(account2Id, date))
            .ReturnsAsync(7);

        var query = new GetPortfolioTreeQuery(clientId, date);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var clientNode = result.Clients.First();
        Assert.Equal(40000m, clientNode.TotalValueGBP); // 15000 + 25000
        Assert.Equal(10, clientNode.HoldingsCount); // 3 + 7

        var portfolioNode = clientNode.Portfolios.First();
        Assert.Equal(40000m, portfolioNode.TotalValueGBP);
        Assert.Equal(10, portfolioNode.HoldingsCount);

        Assert.Equal(2, portfolioNode.Accounts.Count);
        Assert.Equal(15000m, portfolioNode.Accounts.First(a => a.Id == account1Id).TotalValueGBP);
        Assert.Equal(25000m, portfolioNode.Accounts.First(a => a.Id == account2Id).TotalValueGBP);
    }

    [Fact]
    public async Task Handle_WithEmptyPortfolio_ReturnsZeroValues()
    {
        // Arrange
        var clientId = Guid.NewGuid();
        var portfolioId = Guid.NewGuid();
        var date = new DateOnly(2025, 6, 11);

        var client = new Client
        {
            Id = clientId,
            Name = "Empty Client",
            Portfolios = new List<Portfolio>
            {
                new()
                {
                    Id = portfolioId,
                    Name = "Empty Portfolio",
                    ClientId = clientId,
                    Accounts = new List<Account>() // No accounts
                }
            }
        };

        _mockRepository.Setup(r => r.GetClientsWithPortfoliosAsync(clientId))
            .ReturnsAsync(new[] { client });

        var query = new GetPortfolioTreeQuery(clientId, date);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var clientNode = result.Clients.First();
        Assert.Equal(0m, clientNode.TotalValueGBP);
        Assert.Equal(0, clientNode.HoldingsCount);

        var portfolioNode = clientNode.Portfolios.First();
        Assert.Equal(0m, portfolioNode.TotalValueGBP);
        Assert.Equal(0, portfolioNode.HoldingsCount);
        Assert.Empty(portfolioNode.Accounts);
    }

    [Fact]
    public async Task Handle_WithNoClientId_ReturnsAllClients()
    {
        // Arrange
        var client1Id = Guid.NewGuid();
        var client2Id = Guid.NewGuid();
        var date = new DateOnly(2025, 6, 11);

        var clients = new[]
        {
            new Client { Id = client1Id, Name = "Client 1", Portfolios = new List<Portfolio>() },
            new Client { Id = client2Id, Name = "Client 2", Portfolios = new List<Portfolio>() }
        };

        _mockRepository.Setup(r => r.GetClientsWithPortfoliosAsync(null))
            .ReturnsAsync(clients);

        var query = new GetPortfolioTreeQuery(Date: date);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        var clientNodes = result.Clients;
        Assert.Equal(2, clientNodes.Count);
        Assert.Contains(clientNodes, c => c.Id == client1Id && c.Name == "Client 1");
        Assert.Contains(clientNodes, c => c.Id == client2Id && c.Name == "Client 2");
    }
}
