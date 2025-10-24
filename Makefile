.PHONY: help start stop restart rebuild logs status shell clean migrate

# Default target
help:
	@echo "Time-Weighted Return Application - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  start       Start all Docker services"
	@echo "  stop        Stop all Docker services"
	@echo "  restart     Restart all Docker services"
	@echo "  rebuild     Rebuild and start all services"
	@echo "  logs        View logs (use 'make logs-api' or 'make logs-frontend')"
	@echo "  status      Show status of all services"
	@echo "  shell-api   Open shell in API container"
	@echo "  shell-fe    Open shell in frontend container"
	@echo "  migrate     Run database migrations"
	@echo "  clean       Remove all containers and volumes"
	@echo ""

# Start services
start:
	@echo "Starting all Docker services..."
	@docker-compose up -d
	@echo "✓ Services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "API: http://localhost:8080"

# Stop services
stop:
	@echo "Stopping all Docker services..."
	@docker-compose down
	@echo "✓ Services stopped!"

# Restart services
restart:
	@echo "Restarting all Docker services..."
	@docker-compose restart
	@echo "✓ Services restarted!"

# Rebuild services
rebuild:
	@echo "Rebuilding and starting Docker services..."
	@docker-compose up -d --build
	@echo "✓ Services rebuilt and started!"

# View all logs
logs:
	@docker-compose logs -f

# View API logs
logs-api:
	@docker-compose logs -f api

# View frontend logs
logs-frontend:
	@docker-compose logs -f frontend

# View Redis logs
logs-redis:
	@docker-compose logs -f redis

# Show status
status:
	@docker-compose ps

# Shell in API container
shell-api:
	@docker-compose exec api sh

# Shell in frontend container
shell-fe:
	@docker-compose exec frontend sh

# Run migrations
migrate:
	@echo "Running database migrations..."
	@docker-compose exec api dotnet ef database update --project /app/src/Infrastructure
	@echo "✓ Migrations completed!"

# Clean everything
clean:
	@echo "This will remove all containers, volumes, and images. Are you sure? [y/N]" && read ans && [ $${ans:-N} = y ]
	@echo "Cleaning up Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f
	@echo "✓ Cleanup completed!"

# Install/update dependencies
deps:
	@echo "Installing backend dependencies..."
	@dotnet restore
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✓ Dependencies installed!"

# Run local (non-Docker) development
dev:
	@echo "Starting local development servers..."
	@echo "Open two terminals and run:"
	@echo "  Terminal 1: dotnet run --project src/Api"
	@echo "  Terminal 2: cd frontend && npm run dev"
