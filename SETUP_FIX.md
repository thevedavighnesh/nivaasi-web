# 🔧 Fix: Signup Page Error

## Problem
You're getting: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Cause:** The backend API needs environment variables to work. Without them, it returns HTML error pages instead of JSON.

## Quick Fix (5 minutes)

### Step 1: Generate AUTH_SECRET

Run this command in PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output (it will look like: `abc123XYZ...`)

### Step 2: Set Up Database

**Option A - Neon (Easiest, Free, No Install):**

1. Go to https://neon.tech
2. Sign up (free)
3. Click "Create Project"
4. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db`)
5. In Neon dashboard, go to "SQL Editor"
6. Open `database/schema.sql` in your project
7. Copy ALL the contents
8. Paste into Neon SQL Editor
9. Click "Run"
10. ✅ Database is ready!

**Option B - Local PostgreSQL:**

```bash
createdb nivasi
psql nivasi -f database/schema.sql
```

Your connection string: `postgresql://postgres:password@localhost:5432/nivasi`

### Step 3: Create .env File

Create a new file named `.env` in the project root with:

```env
# Replace with your actual database URL from Step 2
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require

# Replace with the secret from Step 1
AUTH_SECRET=your-generated-secret-here

# Keep these as-is
AUTH_URL=http://localhost:4000
EXPO_PUBLIC_BASE_URL=http://localhost:4000
EXPO_PUBLIC_PROXY_BASE_URL=http://localhost:4000
EXPO_PUBLIC_PROJECT_GROUP_ID=nivasi-app
EXPO_PUBLIC_HOST=localhost:4000
```

### Step 4: Restart the Server

1. Stop the current server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Wait for server to start
4. Go to: http://localhost:4000/account/signup
5. ✅ Signup should work now!

## Verify It's Working

1. Open http://localhost:4000/account/signup
2. Fill in the form
3. Click "Sign Up"
4. If successful, you'll be redirected to signin page
5. Sign in with your credentials

## Still Having Issues?

Check the terminal where the server is running for error messages. Common issues:

- **Database connection error:** Check your DATABASE_URL format
- **Auth error:** Make sure AUTH_SECRET is at least 32 characters
- **Port in use:** Change port in vite.config.ts

## Next Steps

Once signup works:
1. Create an account
2. Sign in
3. Explore the dashboard
4. Add properties (if owner) or view assigned properties (if tenant)

---

**Note:** The `.env` file is gitignored, so your secrets are safe!
