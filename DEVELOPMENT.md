# Nivaasi Web Development Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Web Application Configuration
VITE_BASE_URL=http://localhost:3000

# Database Configuration (optional for development)
DATABASE_URL=your_database_connection_string

# Authentication Configuration
VITE_PROJECT_GROUP_ID=nivasi-web-app
```

### 3. Development Mode

#### Option A: Frontend Only (with mock API)
```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the mock API server
npm run server
```

#### Option B: Full Development (both frontend and backend)
```bash
npm run dev:full
```

### 4. Production Build
```bash
npm run build
npm run start
```

## 📱 Application Features

### For Property Owners:
- **Dashboard**: Overview of properties, tenants, and payments
- **Property Management**: Add, view, and manage properties
- **Tenant Management**: Add tenants, track rent status
- **Payment Recording**: Record and track rent payments
- **Reports**: Generate property and financial reports
- **Maintenance**: Handle maintenance requests

### For Tenants:
- **Dashboard**: View property details and rent status
- **Payment History**: Track payment records
- **Maintenance Requests**: Submit and track requests
- **Documents**: Access lease and property documents

## 🔧 Development Setup

### Mock API Server
The development server (`server.js`) provides mock API endpoints for:
- Authentication (`/api/auth/signin`, `/api/auth/signup`)
- Properties (`/api/properties/*`)
- Tenants (`/api/tenants/*`)
- Payments (`/api/payments/*`)

### Database Integration
For production, you'll need to:
1. Set up a Neon PostgreSQL database
2. Configure the `DATABASE_URL` environment variable
3. The existing API routes in `src/app/api/` are ready for database integration

## 🌐 Accessing the Application

### Development URLs:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000/api/* (Express server)
- **Full App**: http://localhost:3000 (Production build)

### Test Accounts:
For development, you can sign in with any email/password combination:
- **Owner Account**: Use any email containing "owner" (e.g., `owner@test.com`)
- **Tenant Account**: Use any other email (e.g., `tenant@test.com`)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes (Next.js style)
│   ├── owner/dashboard/     # Owner dashboard
│   ├── tenant/dashboard/    # Tenant dashboard
│   └── account/            # Authentication pages
├── components/
│   └── hooks/              # Custom React hooks
└── utils/                  # Utility functions

server.js                   # Development API server
App.tsx                     # Main React application
```

## 🔄 Development Workflow

1. **Frontend Development**: Use `npm run dev` for hot reloading
2. **API Testing**: Use the mock server or integrate with real database
3. **Full Stack Testing**: Use `npm run dev:full` to test both together
4. **Production Testing**: Use `npm run build && npm run start`

## 🚀 Deployment

### Frontend Only (Static Hosting):
```bash
npm run build
# Deploy the 'dist' folder to Netlify, Vercel, etc.
```

### Full Stack (with API):
```bash
npm run build
npm run start
# Deploy to platforms like Railway, Render, or Heroku
```

## 📝 Notes

- The application is fully converted from React Native to web
- All mobile-specific code has been replaced with web-compatible alternatives
- The UI maintains the same functionality and design as the original mobile app
- Mock API server allows development without database setup
- Ready for production deployment with real database integration
