// Update tenants table to add rent tracking fields
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';

neonConfig.webSocketConstructor = ws;

const envContent = readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL='([^']+)'/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

async function updateSchema() {
  try {
    console.log('🔨 Adding rent tracking fields to tenants table...\n');
    
    // Add rent_due_day column (default: 1st of month)
    await pool.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS rent_due_day INTEGER DEFAULT 1 
      CHECK (rent_due_day >= 1 AND rent_due_day <= 31)
    `);
    console.log('✅ Added rent_due_day column');
    
    // Add last_payment_date column
    await pool.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS last_payment_date DATE
    `);
    console.log('✅ Added last_payment_date column');
    
    // Add rent_status column
    await pool.query(`
      ALTER TABLE tenants 
      ADD COLUMN IF NOT EXISTS rent_status VARCHAR(50) DEFAULT 'pending' 
      CHECK (rent_status IN ('paid', 'pending', 'overdue'))
    `);
    console.log('✅ Added rent_status column');
    
    console.log('\n🎉 Rent tracking system is ready!');
    console.log('📊 New features:');
    console.log('   - Automatic due date tracking (configurable per tenant)');
    console.log('   - Payment status: Paid, Pending, Overdue');
    console.log('   - Last payment date tracking');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

updateSchema();
