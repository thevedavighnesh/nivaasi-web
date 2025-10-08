// Create property_codes table
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
    console.log('🔨 Creating property_codes table...\n');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_codes (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        unit_number VARCHAR(50) NOT NULL,
        rent_amount DECIMAL(10,2) NOT NULL,
        code VARCHAR(10) UNIQUE NOT NULL,
        used BOOLEAN DEFAULT false,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(property_id, unit_number)
      );
    `);
    
    console.log('✅ property_codes table created successfully!');
    console.log('🎉 Code-based connection system is ready!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTable();
