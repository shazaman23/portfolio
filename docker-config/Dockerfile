FROM php:8.1.3-fpm

SHELL [ "/bin/bash", "-l", "-c" ]

# Set Working Directory
WORKDIR /var/www/portfolio

# Copy Composer files
COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY composer.json /var/www/portfolio
COPY docker-config/php/local.ini /usr/local/etc/php/conf.d/local.ini
COPY docker-config/php/fpm/pool.conf /usr/local/etc/php-fpm.d/pool.conf

# Copy app to web root
COPY . /var/www/portfolio

# Install Dependencies, clean cache, install php extensions, composer install, 
#    set www user privileges, install xdebug
RUN apt update && apt install -y \
        curl \
        default-mysql-client \
        git \
        libonig-dev \
        libpng-dev \
        libxml2-dev \
        libzip-dev \
        nodejs \
        npm \
        unzip \
        vim \
        zip \
    && apt upgrade -y && apt clean && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install \
        bcmath \
        calendar \
        ctype \
        dba \
        exif \
        gd \
        gettext \
        iconv \
        mbstring \
        mysqli \
        pcntl \
        pdo_mysql \
        shmop \
        soap \
        sockets \
        xml \
        zip > /dev/null \
    && composer install \
    && groupadd -g 1000 www \
    && useradd -u 1000 -ms /bin/bash -g www www \
    && chown -R www:www /var/www/portfolio \
    && chmod 755 /var/www/portfolio/docker-config/docker-entrypoint.sh \
    && pecl install xdebug && docker-php-ext-enable xdebug

# Change current user to www
USER www

# Install and configure node/npm
RUN curl -o- -L https://yarnpkg.com/install.sh | bash \
    && export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH" \
    && yarn -v \
    && yarn

VOLUME ["/var/www/portfolio"]

# Expose port 9000 and start php-fpm server
EXPOSE 9000

ENTRYPOINT ["/var/www/portfolio/docker-config/docker-entrypoint.sh"]
CMD ["php-fpm"]