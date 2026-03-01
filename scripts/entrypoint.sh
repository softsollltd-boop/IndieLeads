#!/bin/sh
set -e

# Wait for database availability (optional but recommended)
# We can use simple loop or a tool like pg_isready if available

echo "🚀 Starting Production Entrypoint..."

# Ensure Prisma Client is generated (needed after container rebuilds/pruning)
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Sync database schema (Production-safe migrations)
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "⏩ Running production migrations..."
  npx prisma migrate deploy
else
  echo "⏩ Skipping database sync (RUN_MIGRATIONS != true)"
fi

# Execute the main command (the CMD from Dockerfile or docker-compose)
# Debugging: List the dist folder to ensure build files exist
echo "📂 Checking for build files..."
ls -F apps/api/dist/main.js || echo "❌ API build missing!"
ls -F apps/workers/dist/main.js || echo "❌ Worker build missing!"

# Execute the main command (the CMD from Dockerfile or docker-compose)
if [ -z "$@" ]; then
    echo "⚠️ No command provided! Defaulting to start:api"
    exec npm run start:api
else
    echo "🎬 Starting application with command: $@"
    exec "$@"
fi
