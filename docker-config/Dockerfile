# Multi-stage: pull Node 20 from the official Node Alpine image (musl-compatible)
FROM node:20-alpine AS node

FROM php:8.2-fpm-alpine

# Set Working Directory
WORKDIR /var/www/portfolio

# --- System packages + PHP extensions (rarely changes) ---
# Runtime deps installed permanently; build deps added as a named virtual group
# so they can be removed after compilation, keeping the image lean.
RUN apk add --no-cache \
        bash \
        curl \
        freetype-dev \
        gettext-dev \
        git \
        libjpeg-turbo-dev \
        libpng-dev \
        libxml2-dev \
        libzip-dev \
        linux-headers \
        mariadb-client \
        oniguruma-dev \
        unzip \
        vim \
        zip \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        calendar \
        dba \
        exif \
        gd \
        gettext \
        mysqli \
        pcntl \
        pdo_mysql \
        shmop \
        soap \
        sockets \
        xml \
        zip > /dev/null \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del .build-deps \
    && rm -rf /tmp/*

SHELL ["/bin/bash", "-l", "-c"]

# --- Node.js from official Node Alpine image ---
# Copying from node:20-alpine ensures musl-compatible binaries (no gcompat needed).
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && npm install -g pnpm

# --- Create application user ---
# Alpine uses BusyBox addgroup/adduser instead of groupadd/useradd.
RUN addgroup -g 1000 -S www \
    && adduser -u 1000 -D -G www -s /bin/bash www

# --- Composer binary ---
COPY --from=composer /usr/bin/composer /usr/bin/composer

# --- PHP config ---
COPY docker-config/php/local.ini /usr/local/etc/php/conf.d/local.ini
COPY docker-config/php/fpm/pool.conf /usr/local/etc/php-fpm.d/pool.conf

# --- PHP dependencies (only rebuilds when composer.json/lock changes) ---
COPY composer.json composer.lock /var/www/portfolio/
RUN composer install --no-scripts --no-autoloader

# --- JS dependencies (only rebuilds when package.json/pnpm-lock.yaml changes) ---
RUN chown www:www /var/www/portfolio
USER www
COPY --chown=www:www .npmrc package.json pnpm-lock.yaml /var/www/portfolio/
RUN pnpm install --frozen-lockfile

# --- Application code (changes every deploy, but COPY is fast) ---
USER root
COPY . /var/www/portfolio/
RUN composer dump-autoload --optimize \
    && chown -R www:www /var/www/portfolio \
    && chmod 755 /var/www/portfolio/docker-config/docker-entrypoint.sh

# Change current user to www
USER www

VOLUME ["/var/www/portfolio"]

# Expose port 9000 and start php-fpm server
EXPOSE 9000

ENTRYPOINT ["/var/www/portfolio/docker-config/docker-entrypoint.sh"]
CMD ["php-fpm"]
