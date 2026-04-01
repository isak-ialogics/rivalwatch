# VPS Deployment Setup

## Prerequisites on VPS

1. Docker and Docker Compose installed
2. Traefik reverse proxy running on the `proxy` network (or adjust `docker-compose.prod.yml` if using a different proxy)

## Initial VPS Setup

```bash
# Create stack directory
sudo mkdir -p /opt/stacks/rivalwatch
cd /opt/stacks/rivalwatch

# Copy docker-compose.prod.yml and create .env
cp docker-compose.prod.yml /opt/stacks/rivalwatch/
cp .env.example .env
# Edit .env with production values:
#   APP_ENV=production
#   APP_DEBUG=false
#   APP_URL=https://rivalwatch.vigilmon.online
#   DB_HOST=postgres
#   DB_PASSWORD=<strong-password>
#   REDIS_HOST=redis

# Create proxy network if it doesn't exist
docker network create proxy 2>/dev/null || true

# Start the stack
docker compose -f docker-compose.prod.yml up -d
```

## GitHub Repository Secrets Required

| Secret        | Description                          |
|---------------|--------------------------------------|
| `VPS_HOST`    | VPS IP address or hostname           |
| `VPS_USER`    | SSH user on VPS                      |
| `VPS_SSH_KEY` | Private SSH key for VPS access       |

`GITHUB_TOKEN` is automatically available for GHCR authentication.

## DNS

Point `rivalwatch.vigilmon.online` A record to the VPS IP address.
