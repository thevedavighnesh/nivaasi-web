# 🔧 Maintenance Request - Debug "Failed to Create"

## Quick Check

**Open Browser Console (F12) and try creating a request again.**

Look for these logs:

---

## Expected Logs

### **When you click Submit:**

```javascript
🔧 Submitting maintenance request: {
  tenantId: 1,
  propertyId: 1,
  title: "...",
  description: "...",
  priority: "medium"
}
```

**✅ CHECK:** Are `tenantId` and `propertyId` actual numbers (not null/undefined)?

---

### **Response:**

```javascript
Maintenance request response: { ... }
```

**What does the response show?**

---

## Common Issues

### **Issue 1: tenantId or propertyId is null/undefined**

**Console shows:**
```javascript
🔧 Submitting maintenance request: {
  tenantId: null,  ← PROBLEM!
  propertyId: null,  ← PROBLEM!
  ...
}
```

**Cause:** Not connected to a property yet

**Solution:**
1. Make sure you're connected to a property using a code
2. Refresh the page
3. Check tenant dashboard loads property info

---

### **Issue 2: Backend Error**

**Console shows:**
```javascript
Failed to create request: {
  error: "Missing required fields"
}
```

**Check Backend Terminal:**
```
Creating maintenance request: { tenantId: undefined, ... }
```

**Cause:** Data not being sent correctly

---

### **Issue 3: Database Table Doesn't Exist**

**Error:**
```
relation "maintenance_requests" does not exist
```

**Solution:**
Run this SQL in your database:

```sql
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maintenance_property_id ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON maintenance_requests(tenant_id);
```

---

## Quick Test

### **1. Check if you're connected to property:**

Look at tenant dashboard. Do you see:
- Property name?
- Owner info?
- Rent status?

**If NO:** You need to connect using a property code first.

---

### **2. Check tenantId in console:**

When tenant dashboard loads, look for:
```
Tenant info response: { tenant: { tenantId: 1 }, ... }
```

**What is the tenantId value?** `_______`

---

### **3. Try creating a request:**

1. Fill in title and description
2. Click Submit
3. **Copy and paste the console output here:**

```
[Paste console output]
```

---

## API Test

Test the API directly:

```bash
curl -X POST http://localhost:5173/api/maintenance/create \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": 1,
    "propertyId": 1,
    "title": "Test request",
    "description": "This is a test",
    "priority": "medium"
  }'
```

**What response do you get?**

---

## Share This Info

To help debug, share:

1. **Browser Console Output** (when submitting)
2. **Backend Terminal Output** (if any errors)
3. **Result of:**
   ```sql
   SELECT * FROM tenants WHERE id = YOUR_TENANT_ID;
   ```

---

**With the detailed logs, we can identify the exact issue!** 🔍
