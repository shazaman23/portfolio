FROM nginx:alpine

COPY sites-enabled/ /etc/nginx/sites-enabled/
COPY opt/ /etc/nginx/opt/
COPY entrypoint.sh /custom-entrypoint.sh

RUN chmod 775 /custom-entrypoint.sh

ENTRYPOINT ["/custom-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
