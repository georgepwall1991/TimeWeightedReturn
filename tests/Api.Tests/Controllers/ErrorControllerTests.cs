using Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace Api.Tests.Controllers;

public class ErrorControllerTests
{
    private readonly Mock<ILogger<ErrorController>> _mockLogger;
    private readonly ErrorController _controller;

    public ErrorControllerTests()
    {
        _mockLogger = new Mock<ILogger<ErrorController>>();
        _controller = new ErrorController(_mockLogger.Object);
    }

    [Fact]
    public void LogClientError_WithValidRequest_ReturnsOk()
    {
        // Arrange
        var request = new ClientErrorReport
        {
            Message = "Test error message",
            Stack = "Test stack trace",
            Url = "https://test.com",
            UserAgent = "Test User Agent",
            UserId = "test-user",
            Timestamp = DateTime.UtcNow
        };

        // Act
        var result = _controller.LogClientError(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        // Verify logging was called
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("Client Error")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void LogClientError_WithInvalidRequest_ReturnsBadRequest()
    {
        // Arrange
        var request = new ClientErrorReport
        {
            // Missing required fields
            Message = "",
            Url = "",
            Timestamp = default
        };

        _controller.ModelState.AddModelError("Message", "Required");

        // Act
        var result = _controller.LogClientError(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void LogJavaScriptError_WithValidRequest_ReturnsOk()
    {
        // Arrange
        var request = new JavaScriptErrorReport
        {
            Message = "JavaScript error",
            Source = "app.js",
            Line = 123,
            Column = 456,
            Url = "https://test.com",
            UserAgent = "Test User Agent",
            Timestamp = DateTime.UtcNow
        };

        // Act
        var result = _controller.LogJavaScriptError(request);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);

        // Verify logging was called
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => v.ToString()!.Contains("JavaScript Error")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public void LogJavaScriptError_WithInvalidRequest_ReturnsBadRequest()
    {
        // Arrange
        var request = new JavaScriptErrorReport
        {
            // Missing required fields
            Message = "",
            Url = "",
            Timestamp = default
        };

        _controller.ModelState.AddModelError("Message", "Required");

        // Act
        var result = _controller.LogJavaScriptError(request);

        // Assert
        Assert.IsType<BadRequestObjectResult>(result);
    }
}
