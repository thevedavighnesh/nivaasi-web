#!/bin/bash

# Nivaasi Deployment Script
echo "🚀 Nivaasi Deployment Helper"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🌐 Deployment Options:"
echo "1. Railway (Full Stack - Recommended)"
echo "2. Netlify (Frontend Only - Demo)"
echo "3. Vercel (Frontend Only)"
echo "4. Test locally"
echo ""

read -p "Choose deployment option (1-4): " choice

case $choice in
    1)
        echo "🚂 Railway Deployment"
        echo "1. Push your code to GitHub:"
        echo "   git add . && git commit -m 'Deploy to Railway' && git push"
        echo "2. Go to https://railway.app"
        echo "3. Connect your GitHub repo"
        echo "4. Add PostgreSQL service"
        echo "5. Set environment variables:"
        echo "   - PORT: 3001"
        echo "   - NODE_ENV: production"
        echo "   - DATABASE_URL: (from PostgreSQL service)"
        ;;
    2)
        echo "🌐 Netlify Deployment"
        if command -v netlify &> /dev/null; then
            echo "Deploying to Netlify..."
            netlify deploy --prod --dir=dist
        else
            echo "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
            echo "Please run: netlify deploy --prod --dir=dist"
        fi
        ;;
    3)
        echo "▲ Vercel Deployment"
        if command -v vercel &> /dev/null; then
            echo "Deploying to Vercel..."
            vercel --prod
        else
            echo "Vercel CLI not found. Installing..."
            npm install -g vercel
            echo "Please run: vercel --prod"
        fi
        ;;
    4)
        echo "🧪 Testing locally..."
        echo "Starting production server on http://localhost:3001"
        npm run start
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process initiated!"
echo "📖 For detailed instructions, see WEB_DEPLOYMENT.md"
