# 🔧 Fix: Tenant ID Mismatch

## Problem: IDs Don't Match

**Owner recorded payment with:** tenantId = 2
**Tenant fetching history with:** tenantId = ? (different from 2)

---

## 🔍 Step 1: Find the Mismatch

### **A. What ID did tenant use?**

When you logged in as tenant, what did the console show?

```
🔑 Setting Tenant Assignment ID: ???
```

**Write it here:** `_______`

---

### **B. Check Database Directly**

Run these queries:

**Query 1: Check the payment**
```sql
SELECT * FROM payments WHERE tenant_id = 2;
```

**Expected:** 1 row with amount = 25000.00

---

**Query 2: Check tenant assignments**
```sql
SELECT 
  t.id as tenant_assignment_id,
  t.user_id,
  u.name as tenant_name,
  u.email as tenant_email,
  p.name as property_name
FROM tenants t
JOIN users u ON t.user_id = u.id
JOIN properties p ON t.property_id = p.id
ORDER BY t.id;
```

**This shows ALL tenant assignments.**

---

**Query 3: Check which tenant email you logged in with**
```sql
-- Replace with the email you logged in as tenant
SELECT 
  t.id as tenant_assignment_id,
  t.user_id,
  u.email
FROM tenants t
JOIN users u ON t.user_id = u.id
WHERE u.email = 'TENANT_EMAIL_HERE';
```

---

## 🎯 Step 2: Identify the Problem

### **Scenario A: Multiple Tenant Assignments**

If Query 2 shows multiple rows, you might have multiple tenants:

```
tenant_assignment_id | user_id | tenant_name | tenant_email
---------------------|---------|-------------|------------------
         1           |   10    | John Doe    | john@example.com
         2           |   11    | Jane Smith  | jane@example.com
```

**Question:** Which email did you use to log in as tenant?

---

### **Scenario B: Wrong User Logged In**

**Owner recorded payment for:** tenant_assignment_id = 2 (Jane Smith)
**But you logged in as:** john@example.com (tenant_assignment_id = 1)

**Solution:** Log in with the CORRECT tenant email

---

### **Scenario C: API Returns Wrong ID**

The `/api/tenants/info` endpoint might be returning the wrong `tenantId`.

**Test the API:**
```bash
# Replace with the tenant email you used
curl "http://localhost:5173/api/tenants/info?email=TENANT_EMAIL_HERE"
```

**Check the response:**
```json
{
  "tenant": {
    "tenantId": ???  ← What is this value?
  }
}
```

**Question:** Does `tenantId` match the payment's `tenant_id` (2)?

---

## 🔧 Step 3: Fix the Issue

### **Fix Option 1: Log in as Correct Tenant**

If you have multiple tenants:
1. Find which tenant has ID = 2
2. Log in with THAT tenant's email
3. View payment history

**Query to find correct tenant:**
```sql
SELECT u.email 
FROM tenants t
JOIN users u ON t.user_id = u.id
WHERE t.id = 2;
```

Use this email to log in!

---

### **Fix Option 2: Check API Bug**

If the API is returning wrong tenantId, let's debug:

**Check the `/api/tenants/info` endpoint:**

```typescript
// In __create/index.ts, around line 990
tenant: {
  name: tenant.name,
  email: tenant.email,
  phone: tenant.phone,
  tenantId: assignment.id  ← Is this the assignment.id from tenants table?
}
```

**Verify `assignment.id` is from the `tenants` table, not `users` table**

---

### **Fix Option 3: Multiple Assignments (Same User)**

If ONE user has MULTIPLE tenant assignments:

```sql
SELECT t.id, p.name as property_name, t.status
FROM tenants t
JOIN properties p ON t.property_id = p.id
WHERE t.user_id = (SELECT id FROM users WHERE email = 'tenant@example.com');
```

If this returns multiple rows, the API might be returning the FIRST one, but the owner recorded payment for a DIFFERENT one.

**Solution:** Make sure owner records payment for the FIRST (or active) assignment.

---

## 📊 Debug Checklist

Run these and share the results:

### **1. Payment Details**
```sql
SELECT 
  p.id as payment_id,
  p.tenant_id,
  p.amount,
  p.paid_date
FROM payments 
WHERE tenant_id = 2;
```

### **2. Tenant Assignment ID = 2**
```sql
SELECT 
  t.id as tenant_assignment_id,
  t.user_id,
  u.email as tenant_email,
  u.name as tenant_name,
  p.name as property_name,
  t.status
FROM tenants t
JOIN users u ON t.user_id = u.id
JOIN properties p ON t.property_id = p.id
WHERE t.id = 2;
```

### **3. Which Email Did You Use to Log In?**

**Tenant email:** `________________`

### **4. API Test for That Email**
```bash
curl "http://localhost:5173/api/tenants/info?email=YOUR_TENANT_EMAIL"
```

**What is `tenant.tenantId` in the response?** `_______`

---

## 🎯 Quick Fix

**If you know the correct tenant email for ID = 2:**

1. **Find it:**
```sql
SELECT u.email FROM tenants t JOIN users u ON t.user_id = u.id WHERE t.id = 2;
```

2. **Log out and log in with THAT email**

3. **Open console** → Should show:
```
🔑 Setting Tenant Assignment ID: 2
```

4. **Click Payment History** → Payment should appear!

---

## 📝 Share This Info

To help fix the issue, share:

1. **What ID did tenant dashboard show?**
   ```
   🔑 Setting Tenant Assignment ID: ???
   ```

2. **Result of Query 2 (all tenant assignments)**

3. **Which email did you use to log in as tenant?**

4. **Result of API test for that email**

---

**With this info, we can identify exactly where the mismatch is happening!** 🔍✅
