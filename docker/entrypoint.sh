#!/bin/sh
set -e

cd /var/www/html

# Run migrations
php artisan migrate --force

# Cache config, routes, views
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Link storage
php artisan storage:link 2>/dev/null || true

exec "$@"
