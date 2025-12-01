#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/data-source.js

echo "Seeding database..."
node dist/seeds/seed.js

echo "Starting API server..."
exec node dist/main.js
