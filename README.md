# Nivasi - Property Management System

A comprehensive property management system for owners and tenants built with React and Vite for the web.

## 🏗️ Project Structure

```
├── src/              # Source code
├── public/           # Static files
├── database/         # Database schema and seed files
├── .env              # Environment variables
├── index.html        # Main HTML entry point
└── vite.config.ts    # Vite configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon serverless)

### 1. Database Setup

First, set up your PostgreSQL database:

```bash
# Connect to your database
psql -U your_username -d your_database

# Run schema
\i apps/web/database/schema.sql

# (Optional) Load seed data for testing
\i apps/web/database/seed.sql
```

1. Create account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Run schema using Neon's SQL Editor or via psql

### 🚀 Quick Start

### Development
1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start both frontend and backend**
   ```bash
   npm run dev:full
   ```

3. **Open your browser**
   Navigate to `http://localhost:5175`

### Deployment
1. **Quick deploy with helper script**
   ```bash
   npm run deploy
   ```

2. **Or deploy to specific platforms**
   ```bash
   npm run deploy:netlify    # Frontend only
   npm run deploy:vercel     # Frontend only
   npm run deploy:railway    # Full stack (manual)
   ```

3. **See detailed deployment guide**
   Check `WEB_DEPLOYMENT.md` for complete instructions

### 3. Mobile App Setup

```bash
cd apps/mobile

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start Expo development server
npx expo start
```

Scan the QR code with Expo Go app (iOS/Android) to run on your device.

## 🔐 Environment Variables

### Web App (.env)

Create `apps/web/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
# For Neon: postgresql://user:password@ep-xxx.region.aws.neon.tech/database?sslmode=require

# Authentication
AUTH_SECRET=your-secret-key-min-32-characters-long
AUTH_URL=http://localhost:5173

# Optional: External Services
# STRIPE_SECRET_KEY=sk_test_...
# UPLOADCARE_PUBLIC_KEY=...
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Mobile App (.env)

Create `apps/mobile/.env`:

```env
# API Configuration
EXPO_PUBLIC_BASE_URL=http://localhost:5173
EXPO_PUBLIC_PROXY_BASE_URL=http://localhost:5173

# Authentication
EXPO_PUBLIC_PROJECT_GROUP_ID=nivasi-app
EXPO_PUBLIC_HOST=localhost:5173

# For production/deployment
# EXPO_PUBLIC_BASE_URL=https://your-domain.com
# EXPO_PUBLIC_PROXY_BASE_URL=https://your-domain.com
# EXPO_PUBLIC_HOST=your-domain.com
```

## 📱 Features

### Owner Features
- **Dashboard**: Overview of properties, tenants, payments
- **Properties Management**: Add, view, edit properties
- **Tenant Management**: Add tenants, track lease agreements
- **Payment Tracking**: Monitor rent payments, mark as paid
- **Document Management**: Store lease agreements, ID proofs
- **Maintenance Requests**: View and manage tenant requests

### Tenant Features
- **Dashboard**: View property details, upcoming payments
- **Payment History**: Track all rent payments
- **Maintenance Requests**: Submit and track repair requests
- **Documents**: Access lease agreements and documents
- **Profile**: View lease information and contact details

## 🔧 Development

### Web App Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run typecheck    # Run TypeScript type checking
```

### Mobile App Scripts

```bash
npx expo start       # Start Expo dev server
npx expo start --web # Run in web browser
npx expo start --ios # Run on iOS simulator
npx expo start --android # Run on Android emulator
```

## 🗄️ Database Schema

The database includes the following tables:

- **users**: Both owners and tenants
- **properties**: Property listings
- **tenants**: Links users to properties
- **payments**: Rent payment records
- **documents**: Lease agreements, ID proofs
- **maintenance_requests**: Repair/maintenance requests
- **notifications**: User notifications

See `apps/web/database/schema.sql` for complete schema.

## 🔑 Authentication

The app uses credential-based authentication:

1. **Sign Up**: Users create account with email/password
2. **Sign In**: Email and password authentication
3. **JWT Tokens**: Secure token-based sessions
4. **Role-Based Access**: Separate interfaces for owners and tenants

### Default Test Users (from seed data)

**Owner:**
- Email: rajesh@example.com
- Password: (set your own)

**Tenant:**
- Email: priya@example.com
- Password: (set your own)

## 🚢 Deployment

### Web App (Vercel/Netlify)

1. Connect your Git repository
2. Set environment variables in dashboard
3. Deploy command: `npm run build`
4. Output directory: `build`

### Mobile App (Expo EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in (handled by @auth/create)
- `GET /api/auth/token` - Get current session token
- `GET /api/auth/me` - Get current user info

### Dashboard
- `GET /api/dashboard?owner_id={id}` - Owner dashboard stats
- `GET /api/dashboard?tenant_id={id}` - Tenant dashboard stats

### Properties
- `GET /api/properties?owner_id={id}` - List properties
- `POST /api/properties` - Create property

### Tenants
- `GET /api/tenants?owner_id={id}` - List tenants
- `GET /api/tenants?property_id={id}` - Tenants by property
- `POST /api/tenants` - Add tenant

### Payments
- `GET /api/payments?owner_id={id}` - Owner's payments
- `GET /api/payments?tenant_id={id}` - Tenant's payments
- `POST /api/payments` - Create payment
- `PUT /api/payments` - Update payment

### Documents
- `GET /api/documents?owner_id={id}` - Owner's documents
- `GET /api/documents?tenant_id={id}` - Tenant's documents
- `POST /api/documents` - Upload document
- `DELETE /api/documents?id={id}` - Delete document

### Maintenance
- `GET /api/maintenance?owner_id={id}` - Owner's requests
- `GET /api/maintenance?tenant_id={id}` - Tenant's requests
- `POST /api/maintenance` - Create request
- `PUT /api/maintenance` - Update request status

## 🛠️ Tech Stack

### Mobile App
- React Native (Expo SDK 53)
- Expo Router (file-based routing)
- Zustand (state management)
- React Query (data fetching)
- Lucide React Native (icons)

### Web App
- React 18
- React Router 7
- Neon PostgreSQL (serverless)
- Auth.js (authentication)
- Argon2 (password hashing)
- TailwindCSS (styling)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database server is running
- For Neon: Ensure SSL mode is enabled

### Mobile App Not Connecting to API
- Ensure web server is running
- Check EXPO_PUBLIC_BASE_URL matches web server
- For physical device: Use computer's local IP instead of localhost

### Authentication Errors
- Verify AUTH_SECRET is set and at least 32 characters
- Clear browser cookies/cache
- Check AUTH_URL matches your web app URL

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For support, email support@nivasi.com or open an issue in the repository.

---

Built with ❤️ for property owners and tenants
