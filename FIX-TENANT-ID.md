# 🔧 Fix: Tenant ID Foreign Key Violation

## Error
```
insert or update on table "maintenance_requests" violates foreign key constraint "maintenance_requests_tenant_id_fkey"
```

**This means:** The `tenantId` being used doesn't exist in the `tenants` table.

---

## 🔍 Quick Check

### **Step 1: Check Console When Dashboard Loads**

Look for:
```
🔑 Setting Tenant Assignment ID for maintenance: X
```

**What is X?** `_______`

**If you see:**
```
⚠️ WARNING: Tenant assignment ID is not set! Maintenance requests will not work.
```

This means you need to reconnect to the property!

---

### **Step 2: Check Database**

Run this query with the tenantId from the console:

```sql
-- Replace X with your tenantId
SELECT * FROM tenants WHERE id = X;
```

**Does it return a row?**
- **YES** → Good! But there might be another issue
- **NO** → The tenant assignment doesn't exist

---

## ✅ Solution 1: Reconnect to Property

If the tenant assignment doesn't exist in the database:

### **As Owner:**
1. Go to "Generate Code"
2. Select property and unit
3. Generate a NEW code

### **As Tenant:**
1. **Log out**
2. **Log in** as tenant
3. **Enter the NEW code**
4. **Connect**
5. **Refresh** the page
6. **Try maintenance request again**

---

## ✅ Solution 2: Check What Tenants Exist

Run this to see all tenants in the database:

```sql
SELECT 
  t.id as tenant_assignment_id,
  u.email as tenant_email,
  u.name as tenant_name,
  p.name as property_name,
  t.status
FROM tenants t
JOIN users u ON t.user_id = u.id
JOIN properties p ON t.property_id = p.id
ORDER BY t.created_at DESC;
```

**Find your tenant email** in the list and note the `tenant_assignment_id`.

**Does it match the ID shown in the console?**

---

## ✅ Solution 3: Manual Database Fix (If Data Exists)

If you see the tenant in the database but it still doesn't work:

```sql
-- Check if tenant exists
SELECT id, user_id, property_id, status 
FROM tenants 
WHERE user_id = (SELECT id FROM users WHERE email = 'YOUR_TENANT_EMAIL');
```

**If tenant exists but status is 'inactive':**

```sql
UPDATE tenants 
SET status = 'active' 
WHERE user_id = (SELECT id FROM users WHERE email = 'YOUR_TENANT_EMAIL');
```

---

## 🧪 Test the Fix

After fixing:

1. **Refresh tenant dashboard**
2. **Check console:**
   ```
   🔑 Setting Tenant Assignment ID for maintenance: X
   ```
3. **Try creating maintenance request**
4. **Should work!** ✅

---

## 📊 Full Diagnostic Query

Run this to see the complete picture:

```sql
-- Check tenant connection status
SELECT 
  u.email,
  u.name,
  t.id as tenant_assignment_id,
  t.status as tenant_status,
  p.name as property_name,
  p.id as property_id,
  t.created_at as connected_at
FROM users u
LEFT JOIN tenants t ON u.id = t.user_id
LEFT JOIN properties p ON t.property_id = p.id
WHERE u.email = 'YOUR_TENANT_EMAIL';
```

**Expected Output:**
- Email: your tenant email
- Name: tenant name
- tenant_assignment_id: **A NUMBER** (not null)
- tenant_status: **active**
- property_name: property name
- property_id: **A NUMBER**

**If any of these are NULL, you need to reconnect!**

---

## 🚨 Common Scenarios

### **Scenario 1: Tenant Never Connected**
**Symptom:** tenant_assignment_id is NULL

**Fix:** Connect using property code

---

### **Scenario 2: Tenant Connection Deleted**
**Symptom:** tenant_assignment_id exists but query shows no results

**Fix:** Reconnect using a new property code

---

### **Scenario 3: Multiple Tenants with Same Email**
**Symptom:** Multiple rows returned

**Fix:** Use the most recent one (check created_at)

---

## 🔍 What I Added

**Better error message now shows:**
```
Tenant not found: Tenant with ID X does not exist. Please reconnect to your property.
```

---

## 📝 Quick Summary

**The Issue:** Tenant assignment ID in the frontend doesn't match any row in the database.

**The Fix:** Reconnect to property using a fresh code.

**Why It Happens:** 
- Data was deleted
- Never connected in the first place
- Database was reset

---

**Try reconnecting to the property with a fresh code!** 🔄✅
