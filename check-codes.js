// Check property codes table
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';

neonConfig.webSocketConstructor = ws;

const envContent = readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL='([^']+)'/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

const pool = new Pool({ connectionString: DATABASE_URL });

async function checkCodes() {
  try {
    console.log('🔍 Checking property_codes table...\n');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'property_codes'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ property_codes table does NOT exist!');
      console.log('Run: node create-codes-table.js\n');
      return;
    }
    
    console.log('✅ property_codes table exists\n');
    
    // Check all codes
    const result = await pool.query(`
      SELECT pc.*, p.name as property_name 
      FROM property_codes pc
      LEFT JOIN properties p ON pc.property_id = p.id
      ORDER BY pc.created_at DESC
    `);
    
    console.log(`📊 Total codes: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('No codes generated yet. Generate a code from the owner dashboard.\n');
    } else {
      result.rows.forEach(code => {
        const isExpired = new Date(code.expires_at) < new Date();
        const status = code.used ? '🔴 USED' : isExpired ? '🟡 EXPIRED' : '🟢 VALID';
        
        console.log(`${status} Code: ${code.code}`);
        console.log(`   Property: ${code.property_name || 'Unknown'}`);
        console.log(`   Unit: ${code.unit_number}`);
        console.log(`   Rent: ₹${code.rent_amount}`);
        console.log(`   Expires: ${new Date(code.expires_at).toLocaleString()}`);
        console.log(`   Used: ${code.used ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCodes();
