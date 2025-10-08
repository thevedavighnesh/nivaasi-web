# 🔍 Payment History Not Working - Troubleshoot

## Quick Checks

### **1. Restart Dev Server Properly**
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### **2. Check Browser Console**

Open your tenant dashboard and:
1. **Press F12** to open DevTools
2. **Go to Console tab**
3. **Click "Payment History"** button

**What errors do you see?**

Share the errors here: `________________________`

---

## Common Issues

### **Issue 1: useEffect Error**

**Error in console:**
```
useEffect is not defined
```

**Not likely** since we imported it at the top, but if this happens, let me know.

---

### **Issue 2: Button Not Responding**

**Symptoms:**
- Click "Payment History" button
- Nothing happens
- No modal opens

**Check:**
1. Console for JavaScript errors
2. Check if `tenantId` is set:
   - Should see: `🔑 Setting Tenant Assignment ID: X`
   - If shows `undefined`, tenant not connected to property

---

### **Issue 3: Modal Opens But Empty**

**Symptoms:**
- Modal opens
- Shows "No payment history yet"
- But payments exist in database

**Check Console:**
```
Loading payment history for tenantId: X
Payment history response: {...}
Loaded X payments
```

**What does it say?**

---

### **Issue 4: Server Error**

**Check terminal where `npm run dev` is running:**
- Any errors?
- Any SQL errors?

---

## Quick Test

### **Step 1: Check Tenant ID**
1. Log in as tenant
2. Open Console (F12)
3. Look for:
```
🔑 Setting Tenant Assignment ID: 1
```

**What ID do you see?** `_______`

### **Step 2: Check Payment Exists**
```sql
SELECT * FROM payments WHERE tenant_id = 1;  -- Use your tenant ID
```

**Does a payment exist?** YES / NO

### **Step 3: Click Payment History**
1. Click "💳 Payment History" button
2. Check console

**What appears?**
- [ ] Modal opens
- [ ] Shows payments
- [ ] Shows "No payment history yet"
- [ ] Nothing happens
- [ ] Error in console

---

## If Modal Doesn't Open

**Check these console logs:**

Should see:
```
Opening payment history modal
Loading payment history for tenantId: X
```

If you DON'T see these, the button onClick might not be connected properly.

---

## If Modal Opens But Shows Empty

**Backend should log:**
```
Fetching payment history for tenantId: X
Found Y payments for tenant X
```

**If it says "Found 0 payments":**
- Check the tenant ID matches the payment's tenant_id
- Run: `SELECT * FROM payments WHERE tenant_id = X;`

---

## Share These Details

To help debug, share:

1. **Browser Console Output** (after clicking Payment History)
2. **Terminal Output** (backend logs)
3. **Tenant ID** from: `🔑 Setting Tenant Assignment ID: X`
4. **Database Check:**
```sql
SELECT p.id, p.tenant_id, p.amount, p.paid_date
FROM payments p
WHERE p.tenant_id = YOUR_TENANT_ID;
```

---

## Emergency Fix

If nothing works, try:

1. **Hard refresh:** Ctrl+Shift+R or Ctrl+F5
2. **Clear browser cache**
3. **Restart dev server**
4. **Check for syntax errors in console**

---

**Let me know what you see in the console and I can help further!** 🔍
