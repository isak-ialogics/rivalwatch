# VPS Deployment Setup (Docker Swarm)

## Prerequisites

- Docker with Swarm mode initialized on VPS (102.222.160.107)
- Traefik running on the `traefik-public` overlay network (same as Vigil)
- DNS: `rivalwatch.vigilmon.online` -> VPS IP (done)

## Historical VPS setup draft (not an authorized procedure)

**Hold:** This manual path is not authorized to create or deploy services. The template below is incomplete until `IMAGE_SHA256` is replaced with the independently reviewed immutable *application* digest (64 lowercase hex characters, not the PHP base image digest). Missing `IMAGE_SHA256` fails Compose interpolation; an unreviewed value must not be deployed. No stack deploy command is provided. Release acceptance also requires running-container image readback for app, horizon and scheduler; the existing workflow refuses tasks on nodes it cannot inspect.

Historical environment **template only** (not a command or approved configuration):

```text
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
# Required by app, horizon and scheduler: 64 lowercase hex characters of the
# independently reviewed immutable *application* image digest, not the PHP base.
IMAGE_SHA256=REPLACE_WITH_REVIEWED_APPLICATION_IMAGE_SHA256
```

## GitHub Repository Secrets

Same as Vigil repo (`isak-ialogics/vigil`):

| Secret        | Description                    |
|---------------|--------------------------------|
| `VPS_HOST`    | VPS IP (102.222.160.107)       |
| `VPS_USER`    | SSH user on VPS                |
| `VPS_SSH_KEY` | Private SSH key for VPS access |

`GITHUB_TOKEN` is automatically available for GHCR authentication.
