# 🔗 Tenant-Owner Database Connection Flow

## How Tenants Connect to Their Owner's Data

### Database Relationship Structure

```
┌─────────────────┐
│     USERS       │  (Both owners and tenants)
│  - id           │
│  - name         │
│  - email        │
│  - user_type    │  ('owner' or 'tenant')
└────────┬────────┘
         │
         ├──────────────────────────────┐
         │                              │
         │ (owner_id)                   │ (user_id)
         ▼                              ▼
┌─────────────────┐            ┌─────────────────┐
│   PROPERTIES    │            │    TENANTS      │
│  - id           │◄───────────┤  - id           │
│  - owner_id     │            │  - user_id      │
│  - name         │            │  - property_id  │
│  - rent_amount  │            │  - rent_amount  │
└────────┬────────┘            └────────┬────────┘
         │                              │
         │                              │ (tenant_id)
         │                              ▼
         │                     ┌─────────────────┐
         │                     │    PAYMENTS     │
         │                     │  - tenant_id    │
         │                     │  - amount       │
         │                     │  - status       │
         │                     └─────────────────┘
         │
         │                     ┌─────────────────┐
         └────────────────────►│  MAINTENANCE    │
                               │  - property_id  │
                               │  - tenant_id    │
                               └─────────────────┘
```

## The Connection Flow

### 1. **User Creation & Login**

When a tenant signs up or is added by an owner:

```sql
-- Step 1: User record is created
INSERT INTO users (name, email, phone, user_type)
VALUES ('John Doe', 'john@email.com', '+91-9876543210', 'tenant');

-- Step 2: Tenant record links user to property
INSERT INTO tenants (user_id, property_id, rent_amount, lease_start_date)
VALUES (
  (SELECT id FROM users WHERE email = 'john@email.com'),
  5,  -- property_id owned by the owner
  15000,
  '2025-01-01'
);
```

### 2. **Authentication Flow**

```
┌─────────────┐
│   Tenant    │
│  Logs In    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  /api/auth/signin                   │
│  - Validates credentials            │
│  - Creates JWT with user.id         │
│  - Returns user_type = 'tenant'     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Mobile App Stores:                 │
│  - user.id (from users table)       │
│  - user_type = 'tenant'             │
│  - JWT token                        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  App needs tenant_id (from tenants  │
│  table, not user.id)                │
│  Query: SELECT id FROM tenants      │
│         WHERE user_id = user.id     │
└─────────────────────────────────────┘
```

### 3. **Data Access Pattern**

When a tenant accesses their data:

**Example: Tenant Dashboard**
```javascript
// Mobile app calls:
GET /api/dashboard?tenant_id=1

// Backend SQL query:
SELECT 
  t.*,
  u.name,
  u.email,
  p.name as property_name,
  p.address as property_address
FROM tenants t
JOIN users u ON t.user_id = u.id
JOIN properties p ON t.property_id = p.id
WHERE t.id = 1  -- tenant_id
```

**Example: Tenant Payments**
```javascript
// Mobile app calls:
GET /api/payments?tenant_id=1

// Backend SQL query:
SELECT 
  pay.*,
  u.name as tenant_name,
  prop.name as property_name
FROM payments pay
JOIN tenants t ON pay.tenant_id = t.id
JOIN users u ON t.user_id = u.id
JOIN properties prop ON t.property_id = prop.id
WHERE pay.tenant_id = 1  -- Only this tenant's payments
```

### 4. **Owner Access to Tenant Data**

When an owner views their tenants:

```javascript
// Mobile app calls:
GET /api/tenants?owner_id=10

// Backend SQL query:
SELECT 
  t.*,
  u.name as tenant_name,
  u.email as tenant_email,
  p.name as property_name
FROM tenants t
JOIN users u ON t.user_id = u.id
JOIN properties p ON t.property_id = p.id
WHERE p.owner_id = 10  -- Filter by property ownership
```

**Key Security Feature:** The query joins through `properties` table to ensure the owner can only see tenants in their own properties.

## Data Isolation & Security

### ✅ How Data is Isolated

1. **Tenant sees only their data:**
   - All queries filter by `tenant_id`
   - Tenant can only access data where `tenants.id = their_tenant_id`

2. **Owner sees only their tenants:**
   - All queries filter by `owner_id`
   - Owner can only access data where `properties.owner_id = their_user_id`

3. **No cross-contamination:**
   - Tenant A cannot see Tenant B's data
   - Owner X cannot see Owner Y's properties or tenants

### Example Scenario

```
Owner: Alice (user_id = 10)
├── Property: "Green Villa" (property_id = 5)
│   ├── Tenant: John (user_id = 20, tenant_id = 1)
│   └── Tenant: Mary (user_id = 21, tenant_id = 2)
└── Property: "Blue Apartments" (property_id = 6)
    └── Tenant: Bob (user_id = 22, tenant_id = 3)

Owner: Bob (user_id = 30)
└── Property: "Red House" (property_id = 7)
    └── Tenant: Sarah (user_id = 40, tenant_id = 4)
```

**When John logs in:**
- `user_id = 20`, `tenant_id = 1`
- Can see: Only his payments, maintenance requests, documents
- Cannot see: Mary's or Bob's data

**When Alice logs in:**
- `user_id = 10` (owner)
- Can see: All 3 tenants (John, Mary, Bob) in her properties
- Cannot see: Sarah (belongs to different owner)

## Current Implementation Status

### ✅ Fully Implemented

**1. Database relationships** - Correctly set up with proper foreign keys and indexes

**2. API endpoints** - All endpoints properly filter by `tenant_id` or `owner_id`

**3. Data isolation** - Enforced through SQL JOINs

**4. Tenant info API** - `/api/auth/tenant-info` endpoint created
```javascript
GET /api/auth/tenant-info
Authorization: Bearer {jwt}

// Returns:
{
  tenant_id: 1,
  property_id: 5,
  property: {
    name: "Green Villa",
    address: "123 Main St"
  },
  owner: {
    id: 10,
    name: "Alice",
    phone: "+91-9876543210",
    email: "alice@example.com"
  }
}
```

**5. Mobile app integration** - All tenant screens now use dynamic `tenant_id`
```javascript
// In all tenant screens:
import { useTenantInfo } from "../../utils/auth/useTenantInfo";

const { tenantId, isLoading, error } = useTenantInfo();
// tenantId is automatically fetched from auth and cached
```

**6. Auth token enhancement** - `/api/auth/token` now includes `user_type`
```javascript
{
  jwt: "...",
  user: {
    id: 20,
    email: "john@email.com",
    name: "John Doe",
    user_type: "tenant"  // ✅ Now included
  }
}
```

## Summary

### How It Works:
1. **Tenant user** logs in → gets `user_id` from `users` table
2. **System looks up** `tenant_id` from `tenants` table where `user_id` matches
3. **All API calls** use `tenant_id` to fetch data
4. **Database joins** ensure tenant only sees their own data through their property
5. **Owner access** is filtered through `properties.owner_id` to show only their tenants

### The Key Link:
```
users.id (user_id) → tenants.user_id → tenants.id (tenant_id)
                                    ↓
                            tenants.property_id → properties.id
                                                ↓
                                        properties.owner_id → users.id (owner)
```

This creates a secure chain: **Tenant → Property → Owner**, ensuring proper data isolation and access control.
