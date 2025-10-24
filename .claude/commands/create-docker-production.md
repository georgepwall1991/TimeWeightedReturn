# Create Docker Production

Create production-optimized Docker setup with multi-stage builds and security hardening.

## Production Dockerfile
- Multi-stage build (minimize image size)
- Use official images (microsoft/dotnet, node)
- Non-root user
- Health checks
- Optimized layer caching

## Docker Compose for Production
- docker-compose.prod.yml with:
  - API service (with replicas for load balancing)
  - Redis service (with persistence)
  - Nginx reverse proxy (SSL termination)
  - Health checks for all services

## Security
- Scan images with Trivy or Snyk
- Use specific image tags (not :latest)
- Minimal base images (alpine where possible)
- Secret management (not in image)

## Container Registry
- Configure GitHub Container Registry or Docker Hub
- Tag images with version and git SHA
- Automated builds on release

Execute end-to-end autonomously.
