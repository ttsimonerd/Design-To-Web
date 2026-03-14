#!/bin/bash

set -e

echo ""
echo "====================================="
echo "  Rest Express - Project Installer"
echo "====================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Please install Node.js v18 or later from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js v18 or later is required. You have $(node -v)."
  exit 1
fi

echo "Node.js $(node -v) found."
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
echo "Done."
echo ""

# Set up .env file
if [ ! -f .env ]; then
  echo "Setting up environment..."
  echo ""
  read -p "Enter your PostgreSQL DATABASE_URL (or press Enter to skip): " DB_URL

  if [ -n "$DB_URL" ]; then
    echo "DATABASE_URL=$DB_URL" > .env
    echo ".env file created."
  else
    echo "DATABASE_URL=" > .env
    echo "WARNING: No database URL provided. Edit .env and add your DATABASE_URL before running the app."
  fi
else
  echo ".env file already exists, skipping."
fi

echo ""

# Run database migrations if DATABASE_URL is set
if grep -q "DATABASE_URL=." .env 2>/dev/null; then
  echo "Setting up database..."
  npm run db:push
  echo "Database ready."
else
  echo "Skipping database setup (no DATABASE_URL set)."
fi

echo ""
echo "====================================="
echo "  Installation complete!"
echo "====================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The app will be available at http://localhost:5000"
echo ""
