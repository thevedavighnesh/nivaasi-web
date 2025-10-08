# Owner Dashboard - Complete Feature Test Checklist

## ✅ Test All Features

### 1. **Dashboard Stats Display** 🏢
**Location:** Top of dashboard

**Test:**
- [ ] Shows correct number of properties
- [ ] Shows correct number of tenants
- [ ] Shows correct total monthly rent (sum of all rents)
- [ ] Shows correct pending payments count

**Expected:** All 4 stat cards display accurate numbers

**Console Check:**
```
Loading owner dashboard data for: [email]
Properties loaded: X
Tenants loaded: Y
Stats calculated: { properties: X, tenants: Y, totalRent: Z, pendingPayments: W }
```

---

### 2. **Add Property** ➕
**Location:** Quick Actions → "Add Property" button

**Test:**
- [ ] Click "Add Property" button
- [ ] Modal opens with form
- [ ] Fill in all fields:
  - Property Name
  - Address
  - Property Type (dropdown)
  - Total Units
- [ ] Click "Add Property"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Property appears in "Your Properties" list
- [ ] Stats update automatically

**Expected:** New property card created and visible

---

### 3. **Property Cards Display** 🏠
**Location:** "Your Properties" section

**Test:**
- [ ] Properties display as cards
- [ ] Each card shows:
  - Property name
  - Address
  - Property type
  - Units info (occupied/total)
  - Total monthly rent
- [ ] Two action buttons visible:
  - "🔑 Generate Code"
  - "👤 Add Tenant"

**Expected:** All property info displayed correctly

---

### 4. **Generate Code** 🔑
**Location:** Property card → "Generate Code" button

**Test:**
- [ ] Click "Generate Code" on a property
- [ ] Modal opens
- [ ] Fill in:
  - Unit number
  - Rent amount
- [ ] Click "Generate Code"
- [ ] 6-character code appears (e.g., ABC123)
- [ ] Code is copyable
- [ ] Expires in 7 days (shown)

**Expected:** Code generated and displayed

**Database Check:**
```bash
node check-codes.js
```
Should show: 🟢 VALID Code

---

### 5. **Add Tenant (Direct)** 👤
**Location:** Property card → "Add Tenant" button

**Test:**
- [ ] Click "Add Tenant" on a property
- [ ] Modal opens
- [ ] Fill in:
  - Tenant email (must exist in system)
  - Unit number
  - Rent amount
- [ ] Click "Add Tenant"
- [ ] Success message appears
- [ ] Stats update (tenant count +1)

**Expected:** Tenant added and stats update

---

### 6. **Record Payment** 💳
**Location:** Quick Actions → "Record Payment" button

**Test:**
- [ ] Click "Record Payment"
- [ ] Modal opens with dropdown
- [ ] Select a tenant from dropdown
- [ ] Shows tenant info (name, property, unit)
- [ ] Fill in:
  - Amount (pre-filled with rent amount)
  - Payment Date
  - Payment Method (dropdown: Cash, Bank Transfer, UPI, etc.)
  - Notes (optional)
- [ ] Click "Record Payment"
- [ ] Success message appears
- [ ] Pending payments count decreases
- [ ] Tenant's rent status changes to "PAID"

**Expected:** Payment recorded, stats update

**Verify:** Tenant dashboard should show "Rent Paid ✅"

---

### 7. **View All Tenants** 👥
**Location:** Quick Actions → "View All Tenants" button

**Test:**
- [ ] Click "View All Tenants"
- [ ] Modal opens showing tenant list
- [ ] Each tenant card shows:
  - Name
  - Email
  - Phone (if available)
  - Property name
  - Address
  - Unit number
  - Monthly rent
  - "Active" badge
- [ ] Two buttons per tenant:
  - "🔔 Send Reminder" (blue)
  - "🗑️ Remove Tenant" (red)
- [ ] Total tenant count displayed at bottom

**Expected:** All tenants listed with correct info

---

### 8. **Send Reminder** 🔔
**Location:** View All Tenants → "Send Reminder" button

**Test:**
- [ ] Click "Send Reminder" on a tenant
- [ ] Modal opens with:
  - Tenant info displayed
  - Reminder type dropdown (Payment/Lease/Maintenance/General)
  - Pre-filled message with tenant details
- [ ] Message is editable
- [ ] Click "Send Reminder"
- [ ] Success message: "Reminder sent to [Tenant]"
- [ ] Modal closes

**Expected:** Reminder sent

**Verify:** 
1. Tenant should see notification bell 🔴 with count
2. Click bell → reminder visible with message

---

### 9. **Remove Tenant** 🗑️
**Location:** View All Tenants → "Remove Tenant" button

**Test:**
- [ ] Click "Remove Tenant" on a tenant
- [ ] Confirmation dialog appears with warning
- [ ] Dialog shows what will be deleted:
  - Remove tenant access
  - Delete all reminders
  - Delete payment records
  - Cannot be undone
- [ ] Click "Cancel" → nothing happens
- [ ] Click "OK" → tenant removed
- [ ] Success message appears
- [ ] Page refreshes
- [ ] Stats update (tenant count -1)
- [ ] Tenant no longer in list

**Expected:** Tenant removed completely

**Verify:** Unit becomes available again for new tenant

---

### 10. **Reports** 📊
**Location:** Quick Actions → "Reports" button

**Test:**
- [ ] Click "Reports"
- [ ] Modal opens showing:
  - Summary cards:
    - Total Properties
    - Total Tenants
    - Monthly Revenue
    - Occupancy Rate
  - Quick Statistics table
  - Property list with details
- [ ] Click "Download PDF"
- [ ] Print dialog opens
- [ ] Can save/print report

**Expected:** Report generated with all data

---

### 11. **Notifications** 🔔
**Location:** Header → Bell icon

**Test:**
- [ ] Bell icon visible in header
- [ ] Shows red badge if unread (currently empty for owners)
- [ ] Click bell → dropdown opens
- [ ] Shows "No notifications yet" message
- [ ] Shows note about future features

**Expected:** Notifications panel works (currently placeholder for owners)

---

### 12. **Logout** 🚪
**Location:** Header → "Logout" button

**Test:**
- [ ] Click "Logout"
- [ ] Redirects to sign-in page
- [ ] Session cleared
- [ ] Cannot access dashboard without login

**Expected:** Successfully logged out

---

## 🔍 Backend API Tests

### Test APIs Manually:

```bash
# 1. Get properties
curl http://localhost:5173/api/properties/list?ownerEmail=[YOUR_EMAIL]

# 2. Get tenants  
curl http://localhost:5173/api/tenants/list?ownerEmail=[YOUR_EMAIL]

# 3. Get notifications
curl http://localhost:5173/api/notifications/owner?ownerEmail=[YOUR_EMAIL]
```

---

## 🐛 Common Issues to Check

### Issue 1: Stats Not Showing
**Fix:** Check browser console for API errors

### Issue 2: Modal Not Opening
**Fix:** Check state variables (showAddProperty, etc.)

### Issue 3: Code Generation Fails
**Fix:** Ensure property has `id` and all required fields

### Issue 4: Payment Recording Fails
**Fix:** Ensure `rent_status`, `rent_due_day` columns exist in DB

### Issue 5: Tenant List Empty
**Fix:** Check if tenants API returns data

---

## ✅ Success Criteria

All features should:
- ✅ Open modals without errors
- ✅ Submit forms successfully
- ✅ Show success/error messages
- ✅ Update stats automatically
- ✅ Refresh data without page reload
- ✅ Display accurate information
- ✅ Handle errors gracefully

---

## 📊 Final Test Results

**Test Date:** ___________
**Tester:** ___________

| Feature | Status | Notes |
|---------|--------|-------|
| Stats Display | ⬜ Pass / ⬜ Fail | |
| Add Property | ⬜ Pass / ⬜ Fail | |
| Property Cards | ⬜ Pass / ⬜ Fail | |
| Generate Code | ⬜ Pass / ⬜ Fail | |
| Add Tenant | ⬜ Pass / ⬜ Fail | |
| Record Payment | ⬜ Pass / ⬜ Fail | |
| View Tenants | ⬜ Pass / ⬜ Fail | |
| Send Reminder | ⬜ Pass / ⬜ Fail | |
| Remove Tenant | ⬜ Pass / ⬜ Fail | |
| Reports | ⬜ Pass / ⬜ Fail | |
| Notifications | ⬜ Pass / ⬜ Fail | |
| Logout | ⬜ Pass / ⬜ Fail | |

---

**Overall Status:** ⬜ All Pass / ⬜ Issues Found

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
