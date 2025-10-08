# 🚀 Nivasi Launch Checklist

Complete this checklist before launching to production.

## ✅ Development Complete

### Database
- [x] Schema created (`schema.sql`)
- [x] Seed data available (`seed.sql`)
- [x] All tables indexed properly
- [x] Triggers and functions created
- [ ] **ACTION REQUIRED:** Run schema on production database

### Backend APIs
- [x] Authentication endpoints (`/api/auth/*`)
- [x] Dashboard API (`/api/dashboard`)
- [x] Properties API (`/api/properties`)
- [x] Tenants API (`/api/tenants`)
- [x] Payments API (`/api/payments`)
- [x] Documents API (`/api/documents`)
- [x] Maintenance API (`/api/maintenance`)

### Web App
- [x] Sign in page
- [x] Sign up page
- [x] Logout functionality
- [x] Owner dashboard (basic structure exists, needs UI)
- [x] Tenant dashboard (basic structure exists, needs UI)

### Mobile App - Owner Interface
- [x] Dashboard with stats
- [x] Properties management (list, add)
- [x] Tenants management (list, add)
- [x] Payments tracking (list, filter, mark paid)
- [x] Documents management (list, view)
- [x] Tab navigation

### Mobile App - Tenant Interface
- [x] Dashboard with property info
- [x] Payment history
- [x] Maintenance requests (list, create)
- [x] Documents viewer
- [x] Profile page
- [x] Tab navigation

### Authentication & Security
- [x] User registration
- [x] Login/logout
- [x] Password hashing (Argon2)
- [x] JWT token management
- [x] Role-based routing (owner/tenant)
- [x] Secure storage (mobile)
- [x] Dynamic tenant_id lookup from auth
- [x] Tenant info API endpoint

## 🔧 Configuration Required

### 1. Environment Variables

**Web App (.env):**
```bash
cd apps/web
cp .env.example .env
# Edit .env and set:
# - DATABASE_URL (your PostgreSQL connection string)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - AUTH_URL (your web app URL)
```

**Mobile App (.env):**
```bash
cd apps/mobile
cp .env.example .env
# Edit .env and set:
# - EXPO_PUBLIC_BASE_URL (your web API URL)
# - EXPO_PUBLIC_PROXY_BASE_URL (same as above)
# - EXPO_PUBLIC_HOST (your domain)
# - EXPO_PUBLIC_PROJECT_GROUP_ID (app identifier)
```

### 2. Database Setup

```bash
# Option A: Local PostgreSQL
createdb nivasi
psql nivasi < apps/web/database/schema.sql

# Option B: Neon (Serverless)
# 1. Create account at https://neon.tech
# 2. Create new project
# 3. Copy connection string to DATABASE_URL
# 4. Run schema in Neon SQL Editor

# Optional: Load test data
psql nivasi < apps/web/database/seed.sql
```

### 3. Install Dependencies

```bash
# Web app
cd apps/web
npm install

# Mobile app
cd apps/mobile
npm install
```

## 🧪 Testing Checklist

### Local Testing

**Web App:**
```bash
cd apps/web
npm run dev
# Visit http://localhost:5173
```

- [ ] Sign up works
- [ ] Sign in works
- [ ] Logout works
- [ ] API endpoints respond correctly

**Mobile App:**
```bash
cd apps/mobile
npx expo start
# Scan QR code with Expo Go
```

- [ ] App loads without errors
- [ ] Owner interface accessible
- [ ] Tenant interface accessible
- [ ] All tabs work
- [ ] API calls succeed
- [ ] Data displays correctly

### Feature Testing

**Owner Features:**
- [ ] View dashboard stats
- [ ] Add new property
- [ ] View properties list
- [ ] Add new tenant
- [ ] View tenants list
- [ ] View payments
- [ ] Mark payment as paid
- [ ] Filter payments by status
- [ ] View documents

**Tenant Features:**
- [ ] View home dashboard
- [ ] See property details
- [ ] View payment history
- [ ] See next payment due
- [ ] Submit maintenance request
- [ ] View maintenance status
- [ ] Access documents
- [ ] View profile info

### Security Testing
- [ ] Cannot access owner routes as tenant
- [ ] Cannot access tenant routes as owner
- [ ] JWT tokens expire properly
- [ ] Passwords are hashed
- [ ] SQL injection prevented
- [ ] XSS protection works

## 🚀 Pre-Launch Tasks

### 1. Production Database
- [ ] Create production database (Neon/Railway/Supabase)
- [ ] Run schema.sql
- [ ] Configure backups
- [ ] Set up monitoring

### 2. Web App Deployment
- [ ] Deploy to Vercel/Netlify/Railway
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Test production URL

### 3. Mobile App Deployment
- [ ] Update app.json with correct info
- [ ] Configure EAS build
- [ ] Build iOS version
- [ ] Build Android version
- [ ] Test builds on devices
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)

### 4. Monitoring & Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics/Mixpanel)
- [ ] Set up uptime monitoring
- [ ] Configure alerts

## 📋 Known Limitations & Future Enhancements

### Current Limitations
- Web dashboard UI is minimal (mobile-first approach)
- Document upload uses placeholder (needs file storage integration)
- Payment processing is manual (no Stripe/Razorpay integration yet)
- No email notifications
- No SMS reminders
- No push notifications

### Recommended Enhancements
1. **Payment Gateway Integration**
   - Integrate Razorpay or Stripe
   - Enable online rent payment
   - Auto-generate receipts

2. **File Storage**
   - Integrate Uploadcare or AWS S3
   - Enable document uploads
   - Support multiple file types

3. **Notifications**
   - Email notifications (SendGrid/Mailgun)
   - SMS reminders (Twilio)
   - Push notifications (Expo Notifications)

4. **Web Dashboard**
   - Build full-featured web UI for owners
   - Add charts and analytics
   - Export reports (PDF/Excel)

5. **Advanced Features**
   - Bulk operations
   - Recurring payment schedules
   - Automated rent reminders
   - Tenant screening
   - Digital lease signing
   - Maintenance vendor management

## 🎯 Launch Day Checklist

**1 Hour Before Launch:**
- [ ] Final database backup
- [ ] Verify all environment variables
- [ ] Test critical user flows
- [ ] Check error monitoring is active
- [ ] Prepare rollback plan

**Launch:**
- [ ] Deploy web app
- [ ] Verify web app is live
- [ ] Submit mobile apps (if not already)
- [ ] Update DNS (if custom domain)
- [ ] Monitor error logs
- [ ] Test from multiple devices

**Post-Launch (First 24 Hours):**
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Review user feedback
- [ ] Fix critical bugs immediately
- [ ] Communicate with early users

## 📞 Support Contacts

**Technical Issues:**
- Database: [Your DB provider support]
- Hosting: [Your hosting provider support]
- Mobile: Expo support

**Emergency Contacts:**
- Lead Developer: [Your contact]
- DevOps: [Your contact]
- Support Email: support@nivasi.com

## ✨ Success Metrics

Track these metrics post-launch:
- [ ] User registrations
- [ ] Active users (DAU/MAU)
- [ ] Properties added
- [ ] Payments tracked
- [ ] Maintenance requests submitted
- [ ] App crashes/errors
- [ ] API response times
- [ ] User retention rate

---

**Status:** Ready for Launch ✅
**Last Updated:** 2025-09-30
**Version:** 1.0.0

Good luck with your launch! 🎉
