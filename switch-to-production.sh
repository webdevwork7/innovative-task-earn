#!/bin/bash

echo "🚀 Switching Innovative Task Earn to Production Mode..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set!"
    echo "Please ensure your Neon database endpoint is enabled and DATABASE_URL is configured."
    exit 1
fi

# Check if SESSION_SECRET is set
if [ -z "$SESSION_SECRET" ]; then
    echo "⚠️  WARNING: SESSION_SECRET is not set. Using default (not recommended for production)."
    echo "Set SESSION_SECRET environment variable for enhanced security."
fi

echo "✅ Environment checks passed"
echo ""

# Set production mode
export APP_MODE=production
export NODE_ENV=production

echo "🔧 Configuration:"
echo "   APP_MODE: $APP_MODE"
echo "   NODE_ENV: $NODE_ENV"
echo "   Database: ${DATABASE_URL:0:20}..."
echo ""

echo "🎯 Production Features Enabled:"
echo "   ✓ PostgreSQL session storage"
echo "   ✓ Real database connections required"
echo "   ✓ No fallback/demo data"
echo "   ✓ Cashfree production API"
echo "   ✓ Real KYC processing (₹99)"
echo ""

echo "🚀 Starting production server..."
tsx server/index.ts