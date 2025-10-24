# Setup Docker for Development

You are setting up **Docker** for the Time-Weighted Return application development environment.

## Context
Create Docker and Docker Compose configuration for streamlined local development. This makes it easier for new developers to get started and ensures consistency across development environments.

## Implementation Requirements

### Docker Configuration

- **Create `Dockerfile` (multi-stage for production-ready)**
  - Stage 1: Build .NET API (use SDK image)
  - Stage 2: Build frontend (use Node image)
  - Stage 3: Runtime (use ASP.NET runtime image)
  - Copy built frontend to wwwroot for serving
  - Expose port 5000 or 8080
  - Add health check

- **Create `.dockerignore`**
  - Exclude node_modules, bin, obj
  - Exclude .git, .vs, .idea
  - Exclude test results, coverage reports
  - Exclude *.db (SQLite files)

- **Create `docker-compose.yml` for development**
  - Service: `api` (ASP.NET Core API)
    - Build from Dockerfile
    - Volume mount for hot reload (optional)
    - Environment variables
    - Port 5000:5000 or 8080:8080
    - Depends on: db, redis (if using)

  - Service: `frontend` (Vite dev server)
    - Use Node image
    - Volume mount ./frontend
    - Command: npm run dev
    - Port 5173:5173

  - Service: `db` (optional - PostgreSQL or keep SQLite)
    - If using SQLite, mount volume for .db file
    - If adding Postgres: use postgres:15 image

  - Service: `redis` (for future caching)
    - Use redis:7-alpine
    - Port 6379:6379
    - Volume for persistence

### Configuration Files

- **Update `appsettings.Docker.json`** (NEW)
  - Connection strings for Docker services
  - Redis connection string
  - Adjust CORS for Docker network
  - Logging configuration

- **Update `frontend/.env.docker`** (NEW)
  - API URL pointing to Docker service
  - Any other environment-specific settings

### Scripts

- **Create `scripts/dev-docker.sh`** or `.ps1`
  - `docker-compose up --build`
  - Health check wait scripts
  - Seed data if needed

- **Create `scripts/clean-docker.sh`** or `.ps1`
  - Stop and remove containers
  - Clean volumes
  - Clean images

### Documentation

- **Update README.md**
  - Add "Quick Start with Docker" section
  - Document Docker commands
  - Document volume mounts
  - Document environment variables
  - Add troubleshooting section

- **Create `DOCKER.md`** (optional detailed guide)
  - Architecture diagram
  - Service descriptions
  - Development workflow with Docker
  - Production deployment notes

## Acceptance Criteria
- [ ] Dockerfile builds successfully
- [ ] docker-compose.yml starts all services
- [ ] Frontend accessible at http://localhost:5173
- [ ] API accessible at http://localhost:5000 or 8080
- [ ] Hot reload works for frontend
- [ ] Database persists data across restarts
- [ ] Redis service running (ready for future use)
- [ ] Health check endpoint responds
- [ ] README updated with Docker instructions
- [ ] .dockerignore properly excludes files
- [ ] docker-compose down cleans up properly

## Related Files
- `Dockerfile` (NEW)
- `.dockerignore` (NEW)
- `docker-compose.yml` (NEW)
- `src/Api/appsettings.Docker.json` (NEW)
- `frontend/.env.docker` (NEW)
- `scripts/dev-docker.sh` (NEW)
- `scripts/clean-docker.sh` (NEW)
- `README.md`
- `DOCKER.md` (NEW - optional)

## Implementation Notes
- Keep it simple for development - optimize for developer experience
- Use volume mounts for code to enable hot reload
- Consider using `docker-compose.override.yml` for local overrides
- Add `.env.example` for environment variables
- Consider adding Makefile for common Docker commands
- SQLite works fine in Docker with volume mount
- Redis is optional but good to have ready

## Example Commands to Document
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Rebuild after changes
docker-compose up --build

# Stop all services
docker-compose down

# Clean everything
docker-compose down -v --remove-orphans
```

Execute this implementation end-to-end autonomously.
