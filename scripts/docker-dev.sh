#!/bin/bash

# Docker Development Script for Time-Weighted Return Application
# This script provides easy commands for Docker-based development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created. You can customize it if needed."
    fi
}

# Start all services
start() {
    print_info "Starting all Docker services..."
    docker-compose up -d

    print_info "Waiting for services to be healthy..."
    sleep 5

    print_success "Services started successfully!"
    print_info "Frontend: http://localhost:5173"
    print_info "API: http://localhost:8080"
    print_info "API Health: http://localhost:8080/api/health/ping"
    print_info "Swagger: http://localhost:8080/swagger"
}

# Stop all services
stop() {
    print_info "Stopping all Docker services..."
    docker-compose down
    print_success "Services stopped successfully!"
}

# Restart all services
restart() {
    print_info "Restarting all Docker services..."
    docker-compose restart
    print_success "Services restarted successfully!"
}

# Rebuild and start services
rebuild() {
    print_info "Rebuilding and starting Docker services..."
    docker-compose up -d --build
    print_success "Services rebuilt and started successfully!"
}

# View logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Show status of services
status() {
    print_info "Docker services status:"
    docker-compose ps
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_info "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Open a shell in a container
shell() {
    if [ -z "$1" ]; then
        print_error "Please specify a service: api, frontend, or redis"
        exit 1
    fi

    docker-compose exec "$1" sh
}

# Run database migrations
migrate() {
    print_info "Running database migrations..."
    docker-compose exec api dotnet ef database update --project /app/src/Infrastructure
    print_success "Migrations completed!"
}

# Show help
show_help() {
    cat << EOF
Docker Development Helper for Time-Weighted Return Application

Usage: $0 [command]

Commands:
    start       Start all Docker services
    stop        Stop all Docker services
    restart     Restart all Docker services
    rebuild     Rebuild and start all services
    logs        View logs (optionally specify service: api, frontend, redis)
    status      Show status of all services
    shell       Open shell in container (specify: api, frontend, or redis)
    migrate     Run database migrations
    clean       Remove all containers, volumes, and images
    help        Show this help message

Examples:
    $0 start                 # Start all services
    $0 logs api              # View API logs
    $0 shell frontend        # Open shell in frontend container
    $0 rebuild               # Rebuild and restart everything

EOF
}

# Main script logic
main() {
    check_docker
    setup_env

    case "${1:-help}" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        rebuild)
            rebuild
            ;;
        logs)
            logs "$2"
            ;;
        status)
            status
            ;;
        shell)
            shell "$2"
            ;;
        migrate)
            migrate
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
