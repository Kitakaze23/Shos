#!/bin/bash

# Development environment setup script
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is installed"
    fi
else
    echo "⚠️  Docker is not installed (optional for local development)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "⚠️  Please update .env with your configuration"
    else
        echo "⚠️  .env.example not found. Please create .env manually"
    fi
else
    echo "✅ .env file exists"
fi

# Setup database (if DATABASE_URL is set)
if [ -f .env ] && grep -q "DATABASE_URL" .env; then
    echo "🗄️  Setting up database..."
    echo "⚠️  Make sure your database is running and DATABASE_URL is correct"
    read -p "Run database migrations now? (yes/no): " run_migrations
    if [ "$run_migrations" = "yes" ]; then
        npx prisma migrate deploy || echo "⚠️  Migration failed. Please check your DATABASE_URL"
    fi
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. Or use Docker Compose: docker-compose up"
