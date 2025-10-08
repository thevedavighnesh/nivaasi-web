# 🔔 Automatic Rent Reminder System

## Overview
The system automatically sends rent reminders to all tenants with pending or overdue rent on the **4th of every month at 9:00 AM IST**.

---

## How It Works

### 1. **Automated Schedule**
- **Schedule**: 4th of every month at 9:00 AM (Asia/Kolkata timezone)
- **Cron Expression**: `0 9 4 * *`

### 2. **Who Gets Reminders?**
The system sends reminders to tenants who:
- ✅ Have `rent_status = 'pending'` or `'overdue'`
- ✅ Haven't paid rent this month
- ✅ `last_payment_date` is from a previous month
- ✅ Have `status = 'active'`

### 3. **Reminder Content**
Each reminder includes:
- 👤 Tenant name
- 🏢 Property name and unit number
- 💰 Rent amount
- 📅 Due date
- ⚠️ Overdue warning (if applicable)
- 👨‍💼 Owner name

---

## Setup & Usage

### **Start the Cron Job**

**Option 1: In Development (Separate Terminal)**
```bash
npm run cron
```

**Option 2: In Production (Background Process)**
```bash
# Using PM2 (recommended for production)
pm2 start rent-reminder-cron.js --name rent-reminders

# Or using nohup
nohup node rent-reminder-cron.js > reminders.log 2>&1 &
```

**Option 3: System Cron (Linux/Mac)**
```bash
# Add to system crontab
crontab -e

# Add this line:
0 9 4 * * cd /path/to/Nivasi-main && node rent-reminder-cron.js >> reminders.log 2>&1
```

---

## Testing the System

### **Test Immediately (Without Waiting)**

1. Open `rent-reminder-cron.js`
2. Uncomment line 117:
```javascript
// sendRentReminders();  ← Remove the //
```
3. Run:
```bash
npm run cron
```

This will send reminders immediately for testing.

**Remember to comment it back after testing!**

---

## Monitoring

### **Check Logs**
The cron job outputs detailed logs:
```
⏰ Rent Reminder Cron Job Started
📅 Schedule: 4th of every month at 9:00 AM
============================================================

============================================================
🔔 Running automatic rent reminder job...
📅 Date: 10/4/2025, 9:00:00 AM
📊 Found 3 tenants with pending/overdue rent

✅ Reminder sent to: John Doe (john@email.com)
   Property: Sunset Apartments, Unit: 101
   Status: PENDING

✅ Reminder sent to: Jane Smith (jane@email.com)
   Property: Oak Towers, Unit: 205
   Status: OVERDUE

🎉 Successfully sent 3 rent reminders!
============================================================
```

### **View Reminders in Database**
```sql
SELECT * FROM reminders 
WHERE reminder_type = 'payment' 
ORDER BY sent_at DESC 
LIMIT 10;
```

---

## Integration with Main App

### **Tenants See Reminders:**
- 🔔 Bell icon in header shows unread count
- Click to view all reminders
- Reminders displayed with full message

### **Owner Tracking:**
- Record Payment button auto-updates status
- Status changes from "Pending" → "Paid"
- Next month: Auto-resets to "Pending"

---

## Customization

### **Change Reminder Day**
Edit `rent-reminder-cron.js` line 98:
```javascript
// Change from 4th to 1st of month:
cron.schedule('0 9 1 * *', async () => {
  // ^^^ Change the 4 to 1
```

### **Change Time**
```javascript
// Change to 6:00 PM:
cron.schedule('0 18 4 * *', async () => {
  // ^^^ hour 9 → 18 (24-hour format)
```

### **Change Message**
Edit the message template in `rent-reminder-cron.js` around line 56.

---

## Production Deployment

### **Using PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start cron job
pm2 start rent-reminder-cron.js --name rent-reminders

# Auto-start on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs rent-reminders

# Stop
pm2 stop rent-reminders
```

### **Using Docker**
Add to your `docker-compose.yml`:
```yaml
services:
  rent-cron:
    build: .
    command: node rent-reminder-cron.js
    environment:
      - DATABASE_URL=${DATABASE_URL}
    restart: always
```

---

## Troubleshooting

### **No Reminders Sent?**
1. Check if tenants have `status = 'active'`
2. Verify `rent_status` is 'pending' or 'overdue'
3. Check `last_payment_date` is from previous month
4. Look at console logs for errors

### **Wrong Timezone?**
Edit `rent-reminder-cron.js` line 100:
```javascript
}, {
  timezone: "Asia/Kolkata"  // Change to your timezone
});
```

### **Database Connection Error?**
- Verify `.env` file has correct `DATABASE_URL`
- Check network/firewall settings
- Ensure database is accessible

---

## Future Enhancements (Not Yet Implemented)

- 📧 Email notifications via SendGrid/Resend
- 📱 SMS notifications via Twilio
- 📊 Reminder analytics dashboard
- ⚙️ Custom reminder schedules per property
- 📝 Template customization via UI

---

## Summary

✅ **Automatic**: Runs every 4th at 9 AM  
✅ **Smart Targeting**: Only unpaid tenants  
✅ **Database Stored**: Tenants see in-app notifications  
✅ **Owner-Friendly**: Auto-updates when payment recorded  
✅ **Production Ready**: PM2 compatible  

**The system is fully functional and ready to use!** 🚀
