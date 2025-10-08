# 🚀 Nivasi Quick Start Guide

Get Nivasi running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- For mobile: Expo Go app on your phone

## Step 1: Database Setup (2 minutes)

### Option A: Neon (Easiest - Free)

1. Go to https://neon.tech and create account
2. Create new project
3. Copy connection string
4. Open Neon SQL Editor
5. Copy and paste contents of `apps/web/database/schema.sql`
6. Click "Run"
7. ✅ Database ready!

### Option B: Local PostgreSQL

```bash
createdb nivasi
psql nivasi -f apps/web/database/schema.sql
```

## Step 2: Web App Setup (1 minute)

```bash
cd apps/web

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DATABASE_URL=your_database_url_here
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_URL=http://localhost:5173
EOF

# Start server
npm run dev
```

Web app now running at http://localhost:5173 🎉

## Step 3: Mobile App Setup (1 minute)

```bash
cd apps/mobile

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
EXPO_PUBLIC_BASE_URL=http://localhost:5173
EXPO_PUBLIC_PROXY_BASE_URL=http://localhost:5173
EXPO_PUBLIC_PROJECT_GROUP_ID=nivasi-app
EXPO_PUBLIC_HOST=localhost:5173
EOF

# Start Expo
npx expo start
```

Scan QR code with Expo Go app 📱

## Step 4: Create Your Account (30 seconds)

1. Open web app: http://localhost:5173/account/signup
2. Fill in details:
   - Name: Your Name
   - Email: your@email.com
   - Phone: +91-9876543210
   - User Type: Owner or Tenant
   - Password: (min 8 characters)
3. Click "Sign Up"
4. Sign in with your credentials

## Step 5: Test the App (30 seconds)

### On Mobile:
1. Open Expo Go app
2. Scan QR code from terminal
3. App loads → you'll see owner or tenant dashboard
4. Explore features!

### On Web:
1. Sign in at http://localhost:5173/account/signin
2. You'll be redirected to dashboard
3. Test API endpoints

## 🎯 What You Can Do Now

### As Owner:
- ✅ Add properties
- ✅ Add tenants
- ✅ Track payments
- ✅ View documents
- ✅ Manage maintenance requests

### As Tenant:
- ✅ View property details
- ✅ See payment history
- ✅ Submit maintenance requests
- ✅ Access documents
- ✅ View profile

## 🐛 Troubleshooting

### Mobile app can't connect to API?

**On physical device:**
```bash
# Find your computer's IP address
# Windows:
ipconfig
# Mac/Linux:
ifconfig

# Update mobile/.env with your IP:
EXPO_PUBLIC_BASE_URL=http://192.168.1.XXX:5173
EXPO_PUBLIC_PROXY_BASE_URL=http://192.168.1.XXX:5173
EXPO_PUBLIC_HOST=192.168.1.XXX:5173
```

### Database connection error?

Check your `DATABASE_URL` format:
```
postgresql://user:password@host:5432/database
```

For Neon, must include `?sslmode=require`:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/db?sslmode=require
```

### Auth errors?

Make sure `AUTH_SECRET` is at least 32 characters:
```bash
openssl rand -base64 32
```

## 📚 Next Steps

1. **Add Test Data** (optional):
   ```bash
   psql your_database -f apps/web/database/seed.sql
   ```

2. **Read Full Documentation**:
   - `README.md` - Complete features and API docs
   - `DEPLOYMENT.md` - Production deployment guide
   - `LAUNCH_CHECKLIST.md` - Pre-launch checklist

3. **Customize**:
   - Update app name in `apps/mobile/app.json`
   - Change colors in theme files
   - Add your logo

## 🆘 Need Help?

- Check `README.md` for detailed docs
- See `LAUNCH_CHECKLIST.md` for testing
- Email: support@nivasi.com

---

**You're all set! Happy property managing! 🏠**
