// Automatic Rent Reminder Cron Job
// Runs every 4th of the month at 9:00 AM to send rent reminders
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';
import cron from 'node-cron';

neonConfig.webSocketConstructor = ws;

const envContent = readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL='([^']+)'/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

// Function to send automatic rent reminders
async function sendRentReminders() {
  try {
    console.log('🔔 Running automatic rent reminder job...');
    console.log('📅 Date:', new Date().toLocaleString());
    
    // Get all active tenants with unpaid rent (not paid this month)
    const result = await pool.query(`
      SELECT 
        t.id as tenant_id,
        t.rent_amount,
        t.unit_number,
        t.rent_due_day,
        t.last_payment_date,
        t.rent_status,
        tenant_user.name as tenant_name,
        tenant_user.email as tenant_email,
        p.name as property_name,
        owner_user.name as owner_name
      FROM tenants t
      JOIN users tenant_user ON t.user_id = tenant_user.id
      JOIN properties p ON t.property_id = p.id
      JOIN users owner_user ON p.owner_id = owner_user.id
      WHERE t.status = 'active'
        AND (
          t.rent_status = 'pending' 
          OR t.rent_status = 'overdue'
          OR t.last_payment_date IS NULL
          OR EXTRACT(MONTH FROM t.last_payment_date) != EXTRACT(MONTH FROM CURRENT_DATE)
          OR EXTRACT(YEAR FROM t.last_payment_date) != EXTRACT(YEAR FROM CURRENT_DATE)
        )
    `);

    const tenants = result.rows;
    console.log(`📊 Found ${tenants.length} tenants with pending/overdue rent\n`);

    if (tenants.length === 0) {
      console.log('✅ All tenants have paid rent this month!');
      return;
    }

    let remindersSent = 0;

    for (const tenant of tenants) {
      const dueDay = tenant.rent_due_day || 5;
      const today = new Date();
      const dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
      
      const message = `Dear ${tenant.tenant_name},

This is a friendly reminder about your rent payment for ${tenant.property_name}, Unit ${tenant.unit_number}.

💰 Rent Amount: ₹${parseFloat(tenant.rent_amount).toLocaleString()}
📅 Due Date: ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
${tenant.rent_status === 'overdue' ? '\n⚠️ OVERDUE: Please pay as soon as possible to avoid late fees.\n' : ''}
Please ensure timely payment to avoid any inconvenience.

Thank you for your cooperation!

Best regards,
${tenant.owner_name}
Property Management`;

      // Insert reminder into database
      await pool.query(
        `INSERT INTO reminders (tenant_id, message, reminder_type, sent_at, created_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [tenant.tenant_id, message, 'payment']
      );

      remindersSent++;
      console.log(`✅ Reminder sent to: ${tenant.tenant_name} (${tenant.tenant_email})`);
      console.log(`   Property: ${tenant.property_name}, Unit: ${tenant.unit_number}`);
      console.log(`   Status: ${tenant.rent_status.toUpperCase()}`);
      console.log('');
    }

    console.log(`\n🎉 Successfully sent ${remindersSent} rent reminders!`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Error sending rent reminders:', error.message);
  }
}

// Schedule the cron job
// Runs on the 4th of every month at 9:00 AM
// Cron format: minute hour day month day-of-week
// '0 9 4 * *' = At 09:00 on day-of-month 4
console.log('⏰ Rent Reminder Cron Job Started');
console.log('📅 Schedule: 4th of every month at 9:00 AM');
console.log('=' .repeat(60));

cron.schedule('0 9 4 * *', async () => {
  console.log('\n' + '=' .repeat(60));
  await sendRentReminders();
}, {
  timezone: "Asia/Kolkata"
});

// For testing: Run immediately on startup (comment out in production)
// Uncomment the line below to test the reminder system
// sendRentReminders();

// Keep the process running
console.log('\n✅ Cron job is running. Press Ctrl+C to stop.\n');
