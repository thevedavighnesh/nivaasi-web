# 🚀 Nivaasi Web Deployment Guide

## Quick Deployment Options

### 🌟 Option 1: Full Stack (Recommended)
Deploy both frontend and backend with a real database.

### 🎯 Option 2: Demo/Portfolio
Deploy frontend only with mock API.

---

## 🌟 Full Stack Deployment

### A. Railway (Easiest - Recommended)

#### 1. Prepare Your Code
```bash
# Build the project
npm run build

# Test production build
npm run start
```

#### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Sign up and connect GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your Nivaasi repository
5. Add environment variables:
   - `PORT`: 3001
   - `NODE_ENV`: production
6. Add PostgreSQL database service
7. Copy `DATABASE_URL` from database service

#### 4. Your App is Live! 🎉
Railway provides a URL like: `https://nivaasi-production.up.railway.app`

---

### B. Render

#### 1. Create Account
Go to [render.com](https://render.com) and sign up

#### 2. Create Web Service
1. Connect GitHub repository
2. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment**: Node

#### 3. Add Database
1. Create PostgreSQL database
2. Add `DATABASE_URL` environment variable

---

### C. Heroku

#### 1. Install Heroku CLI
```bash
# Install Heroku CLI
npm install -g heroku
```

#### 2. Deploy
```bash
# Login to Heroku
heroku login

# Create app
heroku create nivaasi-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main
```

---

## 🎯 Demo/Portfolio Deployment (Frontend Only)

### A. Netlify (Easiest)

#### 1. Build Project
```bash
npm run build
```

#### 2. Deploy
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `dist` folder
3. Or connect GitHub:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

#### 3. Configure Redirects
Create `public/_redirects`:
```
/*    /index.html   200
```

---

### B. Vercel

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
npm run build
vercel --prod
```

---

### C. GitHub Pages

#### 1. Install gh-pages
```bash
npm install --save-dev gh-pages
```

#### 2. Update package.json
```json
{
  "homepage": "https://yourusername.github.io/nivaasi",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### 3. Deploy
```bash
npm run deploy
```

---

## 🔧 Environment Variables

### For Production (.env)
```env
# Production Configuration
VITE_BASE_URL=https://your-domain.com
DATABASE_URL=your_production_database_url
NODE_ENV=production
PORT=3001
```

### For Demo/Development
```env
# Demo Configuration
VITE_BASE_URL=http://localhost:3001
NODE_ENV=development
PORT=3001
```

---

## 📊 Database Options

### A. Neon (PostgreSQL) - Recommended
1. Go to [neon.tech](https://neon.tech)
2. Create free account
3. Create database
4. Copy connection string

### B. PlanetScale (MySQL)
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string

### C. Railway PostgreSQL
1. Add PostgreSQL service in Railway
2. Connection string auto-generated

---

## 🚀 Quick Deploy Commands

### Railway:
```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy" && git push

# 2. Deploy on Railway dashboard
# 3. Add PostgreSQL service
# 4. Set environment variables
```

### Netlify:
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

### Vercel:
```bash
npm run build
npx vercel --prod
```

---

## ✅ Post-Deployment Checklist

- [ ] Application loads at your domain
- [ ] Sign up/sign in works
- [ ] Owner dashboard functions
- [ ] Tenant dashboard works
- [ ] Property management works
- [ ] Payment recording works
- [ ] Code generation works
- [ ] All API endpoints respond
- [ ] Database connected (if full stack)
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)

---

## 🔍 Testing Your Deployment

### 1. Basic Functionality
1. Visit your deployed URL
2. Sign up as owner: `owner@test.com`
3. Add a property
4. Generate connection code
5. Sign up as tenant: `tenant@test.com`
6. Use connection code
7. Test all features

### 2. API Testing
```bash
# Test API health
curl https://your-domain.com/api/auth/signin

# Test with data
curl -X POST https://your-domain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123","userType":"owner"}'
```

---

## 🆘 Common Issues & Solutions

### "API endpoint not implemented"
- Make sure backend server is running
- Check API proxy configuration in vite.config.ts
- Verify environment variables

### Database connection errors
- Check DATABASE_URL format
- Ensure database allows connections from your host
- Verify SSL requirements

### Build failures
- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are installed

### CORS errors
- Add your domain to CORS configuration
- Check API base URL in environment variables

---

## 🎯 Recommended Stack

**For Production:**
- **Hosting**: Railway or Render
- **Database**: Neon PostgreSQL
- **Domain**: Custom domain with SSL

**For Demo/Portfolio:**
- **Hosting**: Netlify or Vercel
- **API**: Mock API (included)

---

## 🌍 Your App is Ready!

Choose your deployment method and get your Nivaasi property management system live in minutes!

**Need help?** Check the logs in your deployment platform or test locally first with `npm run build && npm run start`.

---

**Happy Deploying! 🚀**
