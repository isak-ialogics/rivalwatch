# Stage 1: Composer dependencies
FROM composer:2@sha256:da624c2c705d54e2f5a9bb77a5dc6c7d091711433ebefd7035672e84c2010fee AS vendor
RUN php -r 'if (PHP_VERSION_ID < 80512 || PHP_VERSION_ID >= 80600) { fwrite(STDERR, "Composer PHP 8.5.12+ required\n"); exit(1); }'
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-autoloader --ignore-platform-reqs --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-scripts

# Stage 2: Node build (Vite + React)
FROM node:20-alpine AS node
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production image
FROM php:8.4.27-fpm-alpine@sha256:8ce34c869fae0f8da2c82d8aeda222f0782e8e5ae2b370fb43cbad84e9e2ea55 AS app
RUN php -r 'if (PHP_VERSION_ID < 80427 || PHP_VERSION_ID >= 80500) { fwrite(STDERR, "App PHP 8.4.27+ required\n"); exit(1); }'

LABEL org.opencontainers.image.source="https://github.com/isak-ialogics/rivalwatch"
LABEL org.opencontainers.image.description="RivalWatch — PHP-FPM + Nginx production image"

RUN apk add --no-cache \
    nginx \
    curl \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    supervisor \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql gd zip mbstring bcmath opcache pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /var/cache/apk/* /tmp/pear

# PHP production config
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/99-rivalwatch.ini"

# Nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx-site.conf /etc/nginx/http.d/default.conf

# Supervisor config (runs php-fpm + nginx in app service)
COPY docker/supervisord.conf /etc/supervisord.conf

WORKDIR /var/www/html

# Copy app with dependencies and built assets
COPY --from=vendor /app/vendor ./vendor
COPY --from=node /app/public/build ./public/build
COPY . .

# Clear stale bootstrap cache
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

# Set permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Entrypoint: run migrations + cache on startup
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/up || exit 1

# Default: run nginx + php-fpm via supervisor (app service)
# Horizon and scheduler override CMD in docker-compose.prod.yml
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
