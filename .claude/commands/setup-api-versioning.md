# Setup API Versioning

Implement API versioning to support multiple API versions simultaneously.

## Backend
- Add Microsoft.AspNetCore.Mvc.Versioning
- Configure versioning strategy (URL path or header)
- Create v1 and v2 API structure
- Version controllers with [ApiVersion("1.0")]
- Deprecated version warnings

## Swagger
- Update Swagger to show multiple API versions
- Separate Swagger docs per version
- Version selector in Swagger UI

## Deprecation Strategy
- Sunset headers for deprecated versions
- Deprecation notices in API responses
- Migration guide for version changes

## Frontend
- Configure API client to use specific version
- Handle version negotiation

Execute end-to-end autonomously.
