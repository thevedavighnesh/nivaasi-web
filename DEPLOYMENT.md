# Nivaasi Deployment Guide

## 🚀 Deployment Options

### Option 1: Full Stack Deployment (Recommended)
Deploy both frontend and backend together with a real database.

### Option 2: Frontend Only Deployment
Deploy just the frontend with mock API for demo purposes.

---

## 🌟 Option 1: Full Stack Deployment

### A. Deploy to Railway (Recommended)

Railway is perfect for full-stack Node.js applications with databases.

#### 1. Prepare for Deployment
### Prerequisites

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login
```

### 1. Configure Project

```bash
cd apps/mobile

# Initialize EAS
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BASE_URL": "https://your-domain.com",
        "EXPO_PUBLIC_PROXY_BASE_URL": "https://your-domain.com",
        "EXPO_PUBLIC_HOST": "your-domain.com",
        "EXPO_PUBLIC_PROJECT_GROUP_ID": "nivasi-app"
      }
    },
    "preview": {
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2. Build for iOS

```bash
# Build for iOS
eas build --platform ios --profile production

# For TestFlight
eas build --platform ios --profile preview
```

**Requirements:**
- Apple Developer Account ($99/year)
- Bundle identifier (e.g., com.yourcompany.nivasi)
- App Store Connect access

### 3. Build for Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Keystore (EAS will generate if needed)

### 4. Submit to App Stores

**iOS (App Store):**
```bash
eas submit --platform ios
```

**Android (Play Store):**
```bash
eas submit --platform android
```

### 5. Over-The-Air (OTA) Updates

For quick updates without app store review:

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Users will receive update on next app launch
```

## 🔐 Security Checklist

### Web App
- [ ] AUTH_SECRET is strong (32+ characters)
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] CORS configured for mobile app domain
- [ ] Rate limiting enabled on API routes
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection enabled

### Mobile App
- [ ] API URLs use HTTPS in production
- [ ] Sensitive data stored in SecureStore
- [ ] Certificate pinning for API calls (optional)
- [ ] Code obfuscation enabled

### Database
- [ ] Strong database password
- [ ] IP whitelist configured (if applicable)
- [ ] Regular backups enabled
- [ ] Read replicas for scaling (optional)

## 🚀 Post-Deployment

### 1. Verify Deployment

**Web App:**
```bash
# Test API endpoints
curl https://your-domain.com/api/dashboard?owner_id=1

# Test authentication
curl https://your-domain.com/api/auth/me
```

**Mobile App:**
- Install from TestFlight/Play Store
- Test login flow
- Test all major features
- Check API connectivity

### 2. Monitoring Setup

**Sentry (Error Tracking):**
```bash
# Install Sentry
npm install @sentry/react @sentry/react-native

# Configure in app
```

**Analytics:**
- Google Analytics
- Mixpanel
- Amplitude

### 3. Performance Optimization

**Web:**
- Enable CDN (Vercel/Netlify automatic)
- Configure caching headers
- Optimize images
- Enable compression

**Mobile:**
- Enable Hermes engine (React Native)
- Optimize bundle size
- Lazy load screens
- Cache API responses

## 📊 Scaling Considerations

### Database
- **< 1000 users**: Single Neon instance sufficient
- **1000-10000 users**: Enable connection pooling
- **10000+ users**: Consider read replicas, Redis cache

### API
- **< 10 req/sec**: Single server sufficient
- **10-100 req/sec**: Enable auto-scaling
- **100+ req/sec**: Load balancer + multiple instances

### Storage
- Use cloud storage for documents/images:
  - AWS S3
  - Cloudinary
  - Uploadcare

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/web && npm install
      - run: cd apps/web && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/mobile && npm install
      - run: cd apps/mobile && eas update --branch production
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL requirement
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1"
```

### Mobile App Not Connecting
- Verify EXPO_PUBLIC_BASE_URL is HTTPS
- Check CORS settings on web server
- Test API directly with curl
- Check device network connectivity

### Authentication Errors
- Verify AUTH_SECRET matches between deployments
- Check AUTH_URL is correct
- Clear cookies/cache
- Verify JWT token expiration

## 📞 Support

For deployment issues:
- Email: support@nivasi.com
- Documentation: https://docs.nivasi.com
- GitHub Issues: https://github.com/yourorg/nivasi/issues

---

**Last Updated:** 2025-09-30
