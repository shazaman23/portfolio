#!/bin/bash
set -Eeo pipefail

# Create a new config cache
php artisan config:cache

exec "$@"