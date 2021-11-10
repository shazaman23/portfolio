#!/usr/bin/env sh

set -e

if [ -d "/etc/letsencrypt/live" ]; then
  a2enmod ssl

  sed -ri -e 's,80,443,' /etc/apache2/sites-available/000-default.conf
  sed -i -e '/^<\/VirtualHost>/i SSLEngine on' /etc/apache2/sites-available/000-default.conf
  sed -i -e '/^<\/VirtualHost>/i SSLCertificateFile /etc/letsencrypt/live/jakekillpack.com/cert.pem' /etc/apache2/sites-available/000-default.conf
  sed -i -e '/^<\/VirtualHost>/i SSLCertificateKeyFile /etc/letsencrypt/live/jakekillpack.com/privkey.pem' /etc/apache2/sites-available/000-default.conf
  sed -i -e '/^<\/VirtualHost>/i SSLCertificateChainFile /etc/letsencrypt/live/jakekillpack.com/fullchain.pem' /etc/apache2/sites-available/000-default.conf
fi

exec "$@"
