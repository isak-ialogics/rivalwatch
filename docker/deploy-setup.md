# VPS Deployment Setup (Docker Swarm)

## Prerequisites

- Docker with Swarm mode initialized on VPS (102.222.160.107)
- Traefik running on the `traefik-public` overlay network (same as Vigil)
- DNS: `rivalwatch.vigilmon.online` -> VPS IP (done)

## Initial VPS Setup

```bash
# Create stack directory
sudo mkdir -p /opt/stacks/rivalwatch
cd /opt/stacks/rivalwatch

# Copy docker-compose.prod.yml from repo
# Create .env with production values:
cat > .env << 'EOF'
APP_NAME=RivalWatch
APP_ENV=production
APP_KEY=base64:GENERATE_WITH_ARTISAN
APP_DEBUG=false
APP_URL=https://rivalwatch.vigilmon.online
DB_DATABASE=rivalwatch
DB_USERNAME=rivalwatch
DB_PASSWORD=STRONG_PASSWORD_HERE
REDIS_PASSWORD=
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
EOF

# Deploy the stack
docker stack deploy -c docker-compose.prod.yml rivalwatch
```

## GitHub Repository Secrets

Same as Vigil repo (`isak-ialogics/vigil`):

| Secret        | Description                    |
|---------------|--------------------------------|
| `VPS_HOST`    | VPS IP (102.222.160.107)       |
| `VPS_USER`    | SSH user on VPS                |
| `VPS_SSH_KEY` | Private SSH key for VPS access |

`GITHUB_TOKEN` is automatically available for GHCR authentication.
