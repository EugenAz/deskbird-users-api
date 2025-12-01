#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/src/data-source.js

echo "Seeding database..."
node dist/src/seeds/seed.js

echo "Starting API server..."
exec node dist/main.js
