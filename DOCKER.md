# 🐳 Docker Development Guide

Complete guide for running the Time-Weighted Return application using Docker.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## 🚀 Prerequisites

### Required Software

- **Docker Desktop** 4.0+ ([Download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** 2.0+ (included with Docker Desktop)

### Verify Installation

```bash
docker --version
docker-compose --version
```

---

## ⚡ Quick Start

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd TimeWeightedReturn
```

### 2. Start All Services

**Linux/macOS:**
```bash
./scripts/docker-dev.sh start
```

**Windows PowerShell:**
```powershell
.\scripts\docker-dev.ps1 -Command start
```

**Or use Docker Compose directly:**
```bash
docker-compose up -d
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **API:** http://localhost:8080
- **Swagger API Docs:** http://localhost:8080/swagger
- **Health Check:** http://localhost:8080/api/health/ping

### 4. Default Credentials

```
Email: admin@portfolioanalytics.com
Password: Admin123!@#
```

---

## 🏗️ Architecture Overview

### Multi-Stage Docker Build

The application uses a multi-stage Dockerfile for optimal image size and security:

```
┌─────────────────────────────────────────┐
│  Stage 1: Frontend Build (Node 20)     │
│  - npm install                          │
│  - npm run build                        │
│  - Output: dist/                        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Stage 2: Backend Build (.NET 9 SDK)   │
│  - dotnet restore                       │
│  - dotnet build                         │
│  - dotnet publish                       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Stage 3: Runtime (.NET 9 Runtime)     │
│  - Copy published backend               │
│  - Copy built frontend to wwwroot       │
│  - Minimal runtime image                │
└─────────────────────────────────────────┘
```

### Docker Compose Services

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │      │     API     │      │    Redis    │
│   (Vite)    │─────▶│   (.NET 9)  │─────▶│   (Cache)   │
│  Port 5173  │      │  Port 8080  │      │  Port 6379  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       │                    ├─── SQLite DB ───────┤
       │                    │   (Volume Mount)    │
       └────────── twr-network ──────────────────┘
```

---

## 🔧 Services

### 1. Frontend (Vite Dev Server)

- **Image:** `node:20-alpine`
- **Port:** 5173
- **Purpose:** Development server with hot reload
- **Volume Mount:** `./frontend:/app`

**Features:**
- ✅ Live reload on code changes
- ✅ Fast HMR (Hot Module Replacement)
- ✅ TypeScript compilation
- ✅ Tailwind CSS processing

### 2. API (ASP.NET Core)

- **Image:** Custom multi-stage build
- **Port:** 8080
- **Purpose:** Production-like backend API
- **Volume Mount:** `./data:/app/data` (database persistence)

**Features:**
- ✅ .NET 9 runtime
- ✅ JWT authentication
- ✅ Swagger/OpenAPI docs
- ✅ Health checks
- ✅ SQLite database

### 3. Redis (Optional - Future Use)

- **Image:** `redis:7-alpine`
- **Port:** 6379
- **Purpose:** Caching and session storage
- **Volume:** `redis-data` (persistent)

**Features:**
- ✅ Append-only file persistence
- ✅ Health checks
- ✅ Ready for caching implementation

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file from example:

```bash
cp .env.example .env
```

**Key Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | 8080 | API port mapping |
| `FRONTEND_PORT` | 5173 | Frontend port mapping |
| `JWT_SECRET_KEY` | (auto) | JWT signing key |
| `ADMIN_SEED_EMAIL` | admin@... | Admin user email |
| `ADMIN_SEED_PASSWORD` | Admin123!@# | Admin password |

### Application Settings

Docker-specific settings are in `src/Api/appsettings.Docker.json`:

- SQLite database path: `/app/data/PerformanceCalculationDb.db`
- CORS origins include Docker network
- Logging optimized for containers

---

## 💻 Development Workflow

### Using Helper Scripts

**Linux/macOS:**

```bash
# Start services
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs
./scripts/docker-dev.sh logs api

# Restart services
./scripts/docker-dev.sh restart

# Rebuild after code changes
./scripts/docker-dev.sh rebuild

# Open shell in container
./scripts/docker-dev.sh shell api

# Check status
./scripts/docker-dev.sh status

# Stop services
./scripts/docker-dev.sh stop

# Clean everything
./scripts/docker-dev.sh clean
```

**Windows PowerShell:**

```powershell
# Start services
.\scripts\docker-dev.ps1 -Command start

# View logs
.\scripts\docker-dev.ps1 -Command logs -Service api

# Rebuild
.\scripts\docker-dev.ps1 -Command rebuild

# Open shell
.\scripts\docker-dev.ps1 -Command shell -Service frontend
```

### Manual Docker Compose Commands

```bash
# Start in background
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Hot Reload Behavior

| Service | Hot Reload | Requires Rebuild |
|---------|------------|------------------|
| **Frontend** | ✅ Yes (HMR) | No |
| **Backend** | ❌ No | Yes |

**Frontend changes:** Automatically reflected (Vite HMR)

**Backend changes:** Run `./scripts/docker-dev.sh rebuild`

### Database Persistence

The SQLite database is persisted in `./data/` directory:

```bash
# Database file
./data/PerformanceCalculationDb.db

# Backup database
cp ./data/PerformanceCalculationDb.db ./data/backup-$(date +%Y%m%d).db

# Reset database (delete file and restart)
rm ./data/PerformanceCalculationDb.db
docker-compose restart api
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:** `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Solution:**
```bash
# Find process using the port
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Kill the process or change port in .env
API_PORT=8081
```

#### 2. Container Not Starting

**Check logs:**
```bash
docker-compose logs api
```

**Common causes:**
- Missing environment variables
- Database migration issues
- Port conflicts

#### 3. Frontend Can't Connect to API

**Check:**
1. API is running: http://localhost:8080/api/health/ping
2. CORS settings in `appsettings.Docker.json`
3. Frontend env: `VITE_API_URL=http://localhost:8080`

#### 4. Database Lock Error

**Error:** `database is locked`

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove lock file
rm ./data/*.db-wal ./data/*.db-shm

# Restart
docker-compose up -d
```

#### 5. Build Fails

**Clear Docker cache:**
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Health Checks

```bash
# API health
curl http://localhost:8080/api/health/ping

# Check container health
docker-compose ps

# Detailed health status
docker inspect twr-api | grep -A 10 Health
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Since 5 minutes ago
docker-compose logs --since 5m api
```

---

## 🚀 Production Deployment

### Building Production Image

```bash
# Build production image
docker build -t twr-app:latest .

# Run production container
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e JWT_SECRET_KEY=your-production-secret \
  --name twr-app \
  twr-app:latest
```

### Production Considerations

#### 1. Database

Consider upgrading from SQLite to PostgreSQL:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: twr_production
      POSTGRES_USER: twr_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

#### 2. Security

- ✅ Use strong JWT secret
- ✅ Enable HTTPS (reverse proxy)
- ✅ Set strong admin password
- ✅ Configure rate limiting
- ✅ Enable email verification

#### 3. Monitoring

Add health checks and monitoring:

```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/api/health/ping"]
    interval: 30s
    timeout: 3s
    retries: 3
```

#### 4. Scaling

Use Docker Swarm or Kubernetes for multi-instance deployment.

### Docker Hub Deployment

```bash
# Tag image
docker tag twr-app:latest yourusername/twr-app:latest

# Push to Docker Hub
docker push yourusername/twr-app:latest

# Pull and run on production server
docker pull yourusername/twr-app:latest
docker run -d -p 8080:8080 yourusername/twr-app:latest
```

---

## 📊 Performance Tips

### 1. Build Optimization

```bash
# Multi-stage build reduces image size
# Final image: ~300MB (vs ~2GB without multi-stage)
docker images twr-app
```

### 2. Layer Caching

- Package files copied first for better caching
- Source code copied last to leverage cache

### 3. Volume Mounts

- Frontend uses node_modules volume for faster npm install
- Database uses volume for persistence

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** (included in `.gitignore`)
2. **Use Docker secrets** for sensitive data in production
3. **Run as non-root user** in production images
4. **Scan images** for vulnerabilities:
   ```bash
   docker scan twr-app:latest
   ```
5. **Keep base images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [.NET on Docker](https://docs.microsoft.com/en-us/dotnet/core/docker/)
- [Vite on Docker](https://vitejs.dev/guide/static-deploy.html)

---

## 🤝 Contributing

When adding new services to Docker:

1. Update `docker-compose.yml`
2. Add configuration to `appsettings.Docker.json`
3. Update this documentation
4. Update helper scripts if needed
5. Test thoroughly before committing

---

**Happy Dockerizing! 🐳**
