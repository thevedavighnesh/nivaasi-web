// Create reminders table
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';

neonConfig.webSocketConstructor = ws;

// Read from .env file
const envContent = readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL='([^']+)'/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

async function createTable() {
  try {
    console.log('🔨 Creating reminders table...\n');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        reminder_type VARCHAR(50) DEFAULT 'payment' CHECK (reminder_type IN ('payment', 'lease', 'maintenance', 'general')),
        sent_at TIMESTAMP NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ reminders table created successfully!');
    console.log('🔔 Send Reminder feature is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTable();
