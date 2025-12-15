#!/bin/bash

# Database migration script
# Usage: ./scripts/migrate.sh [up|down|create|status]

set -e

MIGRATION_COMMAND=${1:-up}

case $MIGRATION_COMMAND in
  up)
    echo "Running database migrations..."
    npx prisma migrate deploy
    echo "Migrations completed successfully!"
    ;;
  down)
    echo "Rolling back last migration..."
    npx prisma migrate resolve --rolled-back
    echo "Rollback completed!"
    ;;
  create)
    MIGRATION_NAME=${2:-new_migration}
    echo "Creating new migration: $MIGRATION_NAME"
    npx prisma migrate dev --name "$MIGRATION_NAME" --create-only
    echo "Migration created: $MIGRATION_NAME"
    ;;
  status)
    echo "Checking migration status..."
    npx prisma migrate status
    ;;
  reset)
    echo "⚠️  WARNING: This will reset the database!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      npx prisma migrate reset --force
      echo "Database reset completed!"
    else
      echo "Reset cancelled."
    fi
    ;;
  *)
    echo "Usage: ./scripts/migrate.sh [up|down|create|status|reset]"
    echo ""
    echo "Commands:"
    echo "  up      - Apply pending migrations"
    echo "  down    - Rollback last migration"
    echo "  create  - Create a new migration"
    echo "  status  - Check migration status"
    echo "  reset   - Reset database (WARNING: destructive)"
    exit 1
    ;;
esac
