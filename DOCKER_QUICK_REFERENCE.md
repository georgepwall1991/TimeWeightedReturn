# 🐳 Docker Quick Reference Card

Quick reference for common Docker commands for the Time-Weighted Return application.

---

## 🚀 Getting Started

```bash
# Start everything
make start
# OR
./scripts/docker-dev.sh start
# OR
docker-compose up -d

# Access the app
# Frontend: http://localhost:5173
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger
```

---

## 📋 Common Commands

| Action | Makefile | Script | Docker Compose |
|--------|----------|--------|----------------|
| **Start** | `make start` | `./scripts/docker-dev.sh start` | `docker-compose up -d` |
| **Stop** | `make stop` | `./scripts/docker-dev.sh stop` | `docker-compose down` |
| **Restart** | `make restart` | `./scripts/docker-dev.sh restart` | `docker-compose restart` |
| **Rebuild** | `make rebuild` | `./scripts/docker-dev.sh rebuild` | `docker-compose up -d --build` |
| **Logs (all)** | `make logs` | `./scripts/docker-dev.sh logs` | `docker-compose logs -f` |
| **Logs (API)** | `make logs-api` | `./scripts/docker-dev.sh logs api` | `docker-compose logs -f api` |
| **Status** | `make status` | `./scripts/docker-dev.sh status` | `docker-compose ps` |
| **Shell (API)** | `make shell-api` | `./scripts/docker-dev.sh shell api` | `docker-compose exec api sh` |
| **Migrations** | `make migrate` | `./scripts/docker-dev.sh migrate` | See below |
| **Clean** | `make clean` | `./scripts/docker-dev.sh clean` | `docker-compose down -v` |

---

## 🔧 Service-Specific Commands

### Frontend Container

```bash
# Open shell
docker-compose exec frontend sh

# Install new package
docker-compose exec frontend npm install <package>

# View logs
docker-compose logs -f frontend

# Restart just frontend
docker-compose restart frontend
```

### API Container

```bash
# Open shell
docker-compose exec api sh

# Run migrations
docker-compose exec api dotnet ef database update --project /app/src/Infrastructure

# View logs
docker-compose logs -f api

# Restart just API
docker-compose restart api

# Check health
curl http://localhost:8080/api/health/ping
```

### Redis Container

```bash
# Open Redis CLI
docker-compose exec redis redis-cli

# View logs
docker-compose logs -f redis

# Test connection
docker-compose exec redis redis-cli ping
```

---

## 🐛 Debugging

### View Container Status

```bash
docker-compose ps
```

### Inspect Container Details

```bash
docker inspect twr-api
docker inspect twr-frontend
```

### View Resource Usage

```bash
docker stats
```

### Follow Logs in Real-Time

```bash
# All services
docker-compose logs -f

# Specific service with timestamps
docker-compose logs -f --timestamps api

# Last 100 lines
docker-compose logs --tail=100 api
```

### Check Health Status

```bash
# API health endpoint
curl http://localhost:8080/api/health/ping

# Docker health check status
docker inspect --format='{{.State.Health.Status}}' twr-api
```

---

## 🗄️ Database Operations

### Backup Database

```bash
# SQLite database is in ./data/PerformanceCalculationDb.db
cp ./data/PerformanceCalculationDb.db ./data/backup-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Stop services first
docker-compose down

# Restore from backup
cp ./data/backup-20250124.db ./data/PerformanceCalculationDb.db

# Start services
docker-compose up -d
```

### Reset Database

```bash
# Stop services
docker-compose down

# Delete database
rm ./data/PerformanceCalculationDb.db

# Start services (migrations run automatically)
docker-compose up -d
```

### Run Migrations

```bash
docker-compose exec api dotnet ef database update --project /app/src/Infrastructure
```

---

## 🧹 Cleanup Operations

### Remove Containers Only

```bash
docker-compose down
```

### Remove Containers and Volumes

```bash
docker-compose down -v
```

### Full Cleanup (including images)

```bash
docker-compose down -v --rmi all
```

### Cleanup Docker System

```bash
# Remove unused data
docker system prune

# Remove all stopped containers, networks, images
docker system prune -a

# Remove all volumes
docker volume prune
```

---

## 🔄 Update and Rebuild

### After Code Changes

**Frontend changes (hot reload - no rebuild needed):**
```bash
# Just save the file, Vite will auto-reload
```

**Backend changes:**
```bash
# Rebuild API only
docker-compose up -d --build api

# OR full rebuild
make rebuild
```

### Update Dependencies

```bash
# Frontend
docker-compose exec frontend npm install

# Backend - requires rebuild
docker-compose up -d --build api
```

### Pull Latest Images

```bash
docker-compose pull
docker-compose up -d
```

---

## 🌐 Network and Ports

### Default Ports

- Frontend: `5173`
- API: `8080`
- Redis: `6379`

### Change Ports

Edit `.env` file:

```env
FRONTEND_PORT=3000
API_PORT=5000
REDIS_PORT=6380
```

Then restart:

```bash
docker-compose down
docker-compose up -d
```

### Check Port Conflicts

```bash
# macOS/Linux
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

---

## 📦 Volume Management

### List Volumes

```bash
docker volume ls
```

### Inspect Volume

```bash
docker volume inspect timeweightedreturn_redis-data
```

### Backup Volume

```bash
docker run --rm -v timeweightedreturn_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz /data
```

---

## 🔐 Environment Variables

### View Current Environment

```bash
docker-compose exec api env
docker-compose exec frontend env
```

### Override Environment Variables

Create `docker-compose.override.yml`:

```yaml
services:
  api:
    environment:
      - Jwt__SecretKey=your-custom-secret
```

---

## 📊 Performance Monitoring

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific container
docker stats twr-api
```

### Disk Usage

```bash
docker system df
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Inspect container
docker inspect twr-api

# Check events
docker events --since 5m
```

### Port Already in Use

```bash
# Find what's using the port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in .env
```

### Database Locked

```bash
# Stop all containers
docker-compose down

# Remove lock files
rm ./data/*.db-wal ./data/*.db-shm

# Restart
docker-compose up -d
```

### Out of Disk Space

```bash
# Clean up
docker system prune -a --volumes

# Check space
docker system df
```

---

## 📖 Additional Resources

- Full Documentation: [DOCKER.md](DOCKER.md)
- Main README: [README.md](README.md)
- Docker Documentation: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose

---

**💡 Pro Tip:** Use `make help` or `./scripts/docker-dev.sh help` to see available commands!
