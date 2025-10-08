#!/bin/bash

echo "🚂 Railway Deployment Script"
echo "============================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🚂 Deploying to Railway..."
echo ""
echo "Please follow these steps:"
echo "1. Run: railway login"
echo "2. Run: railway up"
echo "3. Run: railway add postgresql"
echo "4. Your app will be live!"
echo ""
echo "Or visit https://railway.app to deploy via dashboard"
echo ""
echo "📖 See RAILWAY_DEPLOY.md for detailed instructions"
