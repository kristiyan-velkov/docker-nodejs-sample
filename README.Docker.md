# Docker Node.js Sample - Deployment Guide

A production-ready Node.js Todo application with TypeScript, React, and Docker containerization.

## Quick Start

### Development

```bash
# Clone and setup
git clone <repository-url>
cd docker-nodejs-sample
cp .env.example .env

# Start development environment
docker compose up --build

# Access points:
# - API: http://localhost:3000
# - Frontend: http://localhost:5173
# - Debugger: localhost:9229
```

### Production

```bash
# Production deployment
docker compose --profile prod up -d --build

# Access the application
# - Application: http://localhost:8080 (mapped from container port 3000)
```

## Available Commands

### Using Task (Recommended)

```bash
# Development
task dev                    # Start development environment
task dev:build             # Build development image
task dev:run               # Run development container

# Production
task build                 # Build production image
task run                   # Run production container
task build-run             # Build and run in one step

# Docker Compose
task compose:up            # Start development services
task compose:up:prod       # Start production services
task compose:down          # Stop all services
task compose:logs          # View logs

# Testing
task test                  # Run tests in container
task test:unit             # Run unit tests with coverage
task test:lint             # Run linting
task test:type-check       # Run TypeScript type checking

# Kubernetes
task k8s:deploy            # Deploy to Kubernetes
task k8s:status            # Check deployment status
task k8s:logs              # View pod logs

# Utilities
task logs                  # Show container logs
task health                # Check application health
task clean                 # Remove containers and images
task --list                # Show all available commands
```

## Application Architecture

- **Backend**: Express.js 5.x with TypeScript, PostgreSQL 16 database, RESTful API
- **Frontend**: React 19 with Vite, Tailwind CSS 4 for styling
- **Build System**: esbuild for server (12KB output), Vite for frontend bundling
- **Database**: PostgreSQL with automatic connection handling and health checks
- **Development**: Hot reload, file watching, automatic database startup

## Docker Configuration

### Multi-Stage Dockerfile

- **Development**: Hot reload, debugging support, dev dependencies
- **Production**: Optimized build, security hardening, minimal footprint
- **Testing**: Isolated test environment with coverage reporting

### Docker Compose Profiles

- **Default/Dev**: Development environment with hot reload
- **Prod**: Production environment with optimized settings
- **Test**: Testing environment for CI/CD

## Environment Variables

Key configuration options in `.env`:

```env
# ========================================
# Environment Configuration Template
# Copy to .env and update values
# ========================================

# ========================================
# Application Configuration
# ========================================
NODE_ENV=development
NODE_VERSION=22.21.0-alpine3.21

# ========================================
# Port Configuration
# ========================================
APP_PORT=3000
VITE_PORT=5173
DEBUG_PORT=9230
PROD_PORT=8080

# ========================================
# Database Configuration
# ========================================
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=todoapp
POSTGRES_USER=todoapp
POSTGRES_PASSWORD=todoapp_password
DB_PORT=5432

# ========================================
# Security Configuration
# ========================================
ALLOWED_ORIGINS=https://yourdomain.com

# ========================================
# Production Deployment
# ========================================
DOCKER_REGISTRY=ghcr.io
DOCKER_USERNAME=your-username
DOCKER_REPOSITORY=docker-nodejs-sample
```

## Production Deployment

### Docker Compose

```bash
# Start production services
docker compose --profile prod up -d

# View logs
docker compose logs -f app-prod

# Stop services
docker compose down
```

### Kubernetes

```bash
# Update image repository in kubernetes manifest
sed -i 's/your-username/YOUR_USERNAME/g' nodejs-sample-kubernetes.yaml

# Deploy to cluster
kubectl apply -f nodejs-sample-kubernetes.yaml

# Check status
kubectl get pods -n todoapp
kubectl get services -n todoapp
```

## Development Workflow

1. **Setup**: `cp .env.example .env` and configure variables
2. **Development**: `task dev` to start with hot reload
3. **Testing**: `task test` to run full test suite
4. **Build**: `task build` to create production image
5. **Deploy**: `task k8s:deploy` for Kubernetes deployment

## Security Features

- Non-root user execution
- Minimal Alpine-based images
- Security scanning in CI/CD
- Health checks and graceful shutdown
- Environment-based configuration
- PostgreSQL secure connections

## Monitoring and Health Checks

- Health endpoint: `/health`
- Container health checks configured
- Kubernetes readiness and liveness probes
- Structured logging for production

## Troubleshooting

### Common Issues

```bash
# Check container logs
task logs

# Check application health
task health

# Interactive debugging
docker exec -it todoapp-prod /bin/sh

# Rebuild from scratch
task clean && task build-run
```

### Database Issues

```bash
# Check PostgreSQL connection
docker logs todoapp-db

# Connect to database
docker exec -it todoapp-db psql -U todoapp -d todoapp

# Reset database (development only)
docker volume rm todoapp-postgres-data
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
