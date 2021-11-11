FROM php:8.0-fpm

SHELL [ "/bin/bash", "-l", "-c" ]

# Set Working Directory
WORKDIR /var/www/portfolio

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY docker-config/php/local.ini /usr/local/etc/php/conf.d/local.ini
COPY docker-config/php/fpm/pool.conf /usr/local/etc/php-fpm.d/pool.conf

# Copy app to web root
COPY . /var/www/portfolio

# Install Dependencies
RUN apt-get update && apt-get install -y \
        build-essential \
        ca-certificates curl \
        git gnupg gosu \
        jpegoptim \
        libc-client2007e-dev libcap2-bin libcurl4-openssl-dev \
        libfreetype6-dev libjpeg62-turbo-dev libldb-dev libldap-2.4-2 libldap2-dev \
        libkrb5-dev libonig-dev libpng-dev libpng-dev libxml2-dev libzip-dev \
        mariadb-client-10.5 \
        nodejs npm \
        optipng \
        python2 \
        supervisor \
        unzip \
        vim \
        zip \
    # Clear apt Cache
    && apt-get -y autoremove \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    # Configure gnupg and ipv6
    && mkdir -p ~/.gnupg \
    && chmod 600 ~/.gnupg \
    && echo "disable-ipv6" >> ~/.gnupg/dirmngr.conf \
    && apt-key adv --homedir ~/.gnupg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys E5267A6C \
    && apt-key adv --homedir ~/.gnupg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C300EE8C \
    # Install PHP Extensions
    && echo "deb http://ppa.launchpad.net/ondrej/php/ubuntu hirsute main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt-get update \
    && docker-php-ext-install \
        bcmath \
        exif \
        gd \
        intl \
        ldap \
        pdo_mysql \
        soap \
        zip \
    # Install Composer
    && composer install \
    # Add group/user www
    && groupadd -g 1000 www \
    && useradd -u 1000 -ms /bin/bash -g www www \
    # Update ownership of working directory
    && chown -R www:www /var/www/portfolio \
    # Set permissions for docker-entrypoint
    && chmod 755 /var/www/portfolio/docker-config/docker-entrypoint.sh

# Change current user to www
USER www

VOLUME ["/var/www/portfolio"]

# Expose port 9000 and start php-fpm server
EXPOSE 9000

ENTRYPOINT ["/var/www/portfolio/docker-config/docker-entrypoint.sh"]
CMD ["php-fpm"]