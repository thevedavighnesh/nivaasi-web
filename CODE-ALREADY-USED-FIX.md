# 🔧 Fix: Code Shows "Already Used" Even When Not Used

## ✅ Issue Fixed

**Problem:** When generating a new code for a property unit that previously had a code, the new code shows as "already used" even though it hasn't been used yet.

---

## 🐛 Root Cause

When regenerating a code for the same property and unit combination, the database uses `ON CONFLICT` to update the existing row instead of creating a new one.

**Before the fix:**
```sql
ON CONFLICT (property_id, unit_number) 
DO UPDATE SET 
  code = $4, 
  expires_at = NOW() + INTERVAL '7 days', 
  created_at = NOW()
```

**Problem:** The `used` flag was NOT being reset to `false`!

So if the previous code was used, the new code would still have `used = true`.

---

## ✅ The Fix

**After the fix:**
```sql
ON CONFLICT (property_id, unit_number) 
DO UPDATE SET 
  code = $4, 
  expires_at = NOW() + INTERVAL '7 days', 
  created_at = NOW(), 
  used = false,              ← ADDED THIS
  rent_amount = $3           ← ALSO UPDATE RENT AMOUNT
```

**Now when a code is regenerated:**
- ✅ New code generated
- ✅ Expiry date reset to 7 days
- ✅ `used` flag reset to `false` ← **FIXED**
- ✅ Rent amount updated

---

## 🧪 How to Test

### **Test 1: Generate Code for Same Unit Multiple Times**

1. **Generate code for Unit 101**
   - Code: ABC123
   - Status: Not used ✓

2. **Use the code** (tenant connects)
   - Code ABC123 marked as used ✓

3. **Generate NEW code for same Unit 101**
   - New Code: XYZ789
   - Status: **Should be Not used** ✓ (was showing as used before)

4. **Try to use the new code**
   - Should work! ✓

---

### **Test 2: Verify in Database**

**After generating a code:**
```sql
SELECT code, used, expires_at 
FROM property_codes 
WHERE property_id = 1 AND unit_number = '101';
```

**Expected:**
```
code    | used  | expires_at
--------|-------|------------------
XYZ789  | false | 2025-10-11 ...
```

**After tenant uses the code:**
```sql
SELECT code, used, expires_at 
FROM property_codes 
WHERE property_id = 1 AND unit_number = '101';
```

**Expected:**
```
code    | used  | expires_at
--------|-------|------------------
XYZ789  | true  | 2025-10-11 ...
```

**Generate ANOTHER code for same unit:**
```sql
SELECT code, used, expires_at 
FROM property_codes 
WHERE property_id = 1 AND unit_number = '101';
```

**Expected:**
```
code    | used  | expires_at
--------|-------|------------------
NEW123  | false | 2025-10-11 ...  ← used = false again!
```

---

## 🔄 What Changed

**File:** `__create/index.ts`

**Endpoint:** `POST /api/properties/generate-code`

**Change:**
```diff
ON CONFLICT (property_id, unit_number) 
DO UPDATE SET 
  code = $4, 
  expires_at = NOW() + INTERVAL '7 days', 
- created_at = NOW()
+ created_at = NOW(), 
+ used = false, 
+ rent_amount = $3
```

---

## 🎯 Impact

**Before:**
- ❌ Regenerating code for same unit kept old `used` status
- ❌ New codes appeared as "already used"
- ❌ Tenants couldn't connect with new codes
- ❌ Had to manually update database

**After:**
- ✅ Every new code starts with `used = false`
- ✅ Tenants can use newly generated codes
- ✅ Can regenerate codes as many times as needed
- ✅ Rent amount also updates when regenerating

---

## 🧪 Test Scenario

### **Scenario: Replace a Tenant**

1. **Owner generates code for Unit 101**
   - Code: ABC123
   
2. **Tenant A connects using ABC123**
   - Tenant A now occupies Unit 101
   - Code ABC123 marked as used ✓

3. **Tenant A moves out**
   - Owner removes tenant from Unit 101

4. **Owner generates NEW code for Unit 101**
   - New Code: XYZ789
   - **Status: NOT used** ✓ (was showing as used before fix)

5. **Tenant B tries to connect using XYZ789**
   - **Works!** ✓ (was failing before)

---

## 📊 Database Schema

**Table:** `property_codes`

**Relevant Columns:**
- `property_id` - Links to property
- `unit_number` - Specific unit
- `code` - 6-character code
- `used` - Boolean (true if code already used)
- `expires_at` - When code expires
- `rent_amount` - Rent for this unit

**Unique Constraint:**
```sql
UNIQUE(property_id, unit_number)
```

This means only ONE code can exist per property+unit combination. When you regenerate, it updates the existing row.

---

## ✅ Summary

**Bug:** Regenerated codes showed as "already used"

**Cause:** `ON CONFLICT UPDATE` didn't reset `used` flag

**Fix:** Added `used = false` to the UPDATE clause

**Result:** Every new code starts fresh, tenants can connect successfully

---

**The fix is applied! Restart your dev server and try generating a code again - it should work now!** ✅🔧
