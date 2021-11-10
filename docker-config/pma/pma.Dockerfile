FROM phpmyadmin/phpmyadmin

COPY docker-config/pma/entrypoint.sh /custom-entrypoint.sh

RUN chmod 775 /custom-entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/custom-entrypoint.sh"]
CMD ["/docker-entrypoint.sh", "apache2-foreground"]