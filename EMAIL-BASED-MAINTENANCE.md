# ✅ Maintenance System - Now Email-Based!

## 🎯 What Changed

**Before:** Maintenance used `tenantId` and `propertyId` (from tenants/properties tables)
**After:** Maintenance uses **tenant EMAIL** (from users table)

Just like the payment system!

---

## 🔄 How It Works Now

### **Submit Maintenance Request:**
1. Tenant clicks "🔧 Maintenance"
2. Fills in form
3. Frontend sends `tenantEmail` (not tenantId)
4. Backend finds tenant by email
5. Backend looks up their assignment
6. Creates maintenance request

### **View Maintenance Requests:**
1. Opens maintenance modal
2. Frontend sends `tenantEmail`
3. Backend finds tenant by email
4. Backend looks up their assignment
5. Returns all maintenance requests for that tenant

---

## 🔧 Technical Changes

### **Backend API Changes**

#### **1. Create Maintenance Request** (`POST /api/maintenance/create`)

**Before:**
```json
{
  "tenantId": 2,
  "propertyId": 1,
  "title": "Broken faucet",
  "description": "...",
  "priority": "high"
}
```

**After:**
```json
{
  "tenantEmail": "tenant@example.com",
  "title": "Broken faucet",
  "description": "...",
  "priority": "high"
}
```

**Process:**
1. Receive `tenantEmail`
2. Query `users` table → get `user.id`
3. Query `tenants` table WHERE `user_id` = user.id → get `tenant.id` and `property_id`
4. Insert into `maintenance_requests` with `tenant_id` and `property_id`

---

#### **2. Get Maintenance Requests** (`GET /api/maintenance/tenant`)

**Before:**
```
GET /api/maintenance/tenant?tenantId=2
```

**After:**
```
GET /api/maintenance/tenant?tenantEmail=tenant@example.com
```

**Process:**
1. Receive `tenantEmail`
2. Query `users` table → get `user.id`
3. Query `tenants` table WHERE `user_id` = user.id → get `tenant.id`
4. Query `maintenance_requests` table WHERE `tenant_id` = tenant.id
5. Return requests

---

### **Frontend Changes**

#### **Tenant Dashboard** (`src/app/tenant/dashboard/page.jsx`)

**State Variables:**
- ❌ Removed: `tenantId` state for maintenance
- ✅ Uses: `user.email` directly

**Load Requests:**
```javascript
const loadMaintenanceRequests = async () => {
  const response = await fetch(
    `/api/maintenance/tenant?tenantEmail=${encodeURIComponent(user.email)}`
  );
  // ...
};
```

**Submit Request:**
```javascript
const handleSubmit = async (e) => {
  const response = await fetch('/api/maintenance/create', {
    method: 'POST',
    body: JSON.stringify({
      tenantEmail,  // Not tenantId!
      title,
      description,
      priority
    })
  });
};
```

---

## ✅ Benefits

### **1. No ID Mismatch Issues**
- Email is ALWAYS the same for a user
- No confusion between different IDs
- Works even if tenant reconnects

### **2. No Foreign Key Violations**
- Backend looks up valid tenant assignment
- If not connected, shows friendly error
- No database constraint violations

### **3. Consistent with Payment System**
- Both use email now
- Same pattern across features
- Easier to maintain

### **4. Better Error Messages**
- "You are not connected to any property" instead of foreign key error
- Clear what user needs to do
- Better UX

---

## 🧪 Testing

### **Test 1: Submit Maintenance Request**

**Console (Frontend):**
```javascript
🔧 Submitting maintenance request: {
  tenantEmail: "tenant@example.com",
  title: "Broken faucet",
  description: "...",
  priority: "high"
}
```

**Console (Backend):**
```
Creating maintenance request: { tenantEmail: "tenant@example.com", title: "...", priority: "high" }
Tenant found: { email: "tenant@example.com", tenantId: 1, propertyId: 1 }
Maintenance request created: { id: 1, tenant_id: 1, property_id: 1, ... }
```

---

### **Test 2: View Maintenance Requests**

**Console (Frontend):**
```javascript
🔧 Loading maintenance requests for email: tenant@example.com
Maintenance requests response: { requests: [...] }
✅ Loaded 2 maintenance requests
```

**Console (Backend):**
```
Fetching maintenance requests for tenant email: tenant@example.com
Found 2 maintenance requests for tenant tenant@example.com (tenant_id: 1)
```

---

## 📊 Database Flow

**Submit Request:**
```
tenantEmail "tenant@example.com"
     ↓
SELECT * FROM users WHERE email = 'tenant@example.com'
     ↓
user.id = 5
     ↓
SELECT * FROM tenants WHERE user_id = 5
     ↓
tenant.id = 1, property_id = 2
     ↓
INSERT INTO maintenance_requests (tenant_id, property_id, ...) 
VALUES (1, 2, ...)
```

---

## ⚠️ Error Handling

### **If Not Connected to Property:**

**Response:**
```json
{
  "error": "You are not connected to any property. Please connect using a property code."
}
```

**User sees:**
```
❌ You are not connected to any property. Please connect using a property code.
```

**Much better than:**
```
❌ Foreign key constraint violated
```

---

## ✅ Summary

**Changed:**
- ✅ Create maintenance request uses `tenantEmail`
- ✅ Get maintenance requests uses `tenantEmail`
- ✅ Backend looks up tenant assignment from email
- ✅ Better error messages
- ✅ Removed `tenantId` state variable

**Result:**
- ✅ No more foreign key violations!
- ✅ Maintenance requests work reliably
- ✅ Consistent with payment system
- ✅ Better error messages
- ✅ More maintainable code

---

## 🎯 All Tenant Features Now Email-Based

| Feature | Identifier |
|---------|-----------|
| 💳 Payment History | ✅ Email |
| 🔧 Maintenance | ✅ Email |
| 📄 Documents | 🔜 To be implemented |
| 👤 Profile | ✅ Email |

---

**Maintenance requests now use EMAIL as the common identifier!** ✅📧🔧
