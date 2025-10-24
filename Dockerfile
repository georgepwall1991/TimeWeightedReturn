# ==============================================
# Stage 1: Build Frontend
# ==============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci && npm cache clean --force

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# ==============================================
# Stage 2: Build Backend
# ==============================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

WORKDIR /app

# Copy project files only (no solution file needed for restore)
COPY src/Domain/*.csproj ./src/Domain/
COPY src/Application/*.csproj ./src/Application/
COPY src/Infrastructure/*.csproj ./src/Infrastructure/
COPY src/Api/*.csproj ./src/Api/

# Restore dependencies (restore the API project which will restore its dependencies)
RUN dotnet restore src/Api/Api.csproj

# Copy entire source code
COPY src/ ./src/

# Build the application
RUN dotnet build src/Api/Api.csproj -c Release -o /app/build

# Publish the application
RUN dotnet publish src/Api/Api.csproj -c Release -o /app/publish

# ==============================================
# Stage 3: Runtime
# ==============================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published backend
COPY --from=backend-build /app/publish .

# Copy built frontend to wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot

# Create directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/api/health/ping || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker

# Run the application
ENTRYPOINT ["dotnet", "Api.dll"]
