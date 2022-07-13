#!/usr/bin/env sh

set -e

# Enable multi-site hosting
sed -e "s/conf.d/sites-enabled/g" /etc/nginx/nginx.conf > temp
mv temp /etc/nginx/nginx.conf

# Enable SSL routing for live sites
if [ -d "/etc/letsencrypt/live" ]; then
    mv /etc/nginx/sites-enabled/portfolio.com.conf /etc/nginx/sites-enabled/portfolio.com.bkp
    mv /etc/nginx/sites-enabled/ssl.portfolio.com.bkp /etc/nginx/sites-enabled/ssl.portfolio.com.conf
fi

exec "$@"