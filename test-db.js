// Quick database test
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { readFileSync } from 'fs';

neonConfig.webSocketConstructor = ws;

// Read from .env file
const envContent = readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL='([^']+)'/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : process.env.DATABASE_URL;

console.log('📍 Testing database:', DATABASE_URL.split('@')[1]?.split('/')[0]);

const pool = new Pool({ connectionString: DATABASE_URL });

async function checkSchema() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected!');
    console.log('   Server time:', result.rows[0].now);
    
    // Check if auth_users table exists
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('auth_users', 'auth_accounts', 'users', 'properties', 'tenants', 'payments')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:', tableCheck.rows.length);
    if (tableCheck.rows.length > 0) {
      tableCheck.rows.forEach(row => {
        console.log('   ✅', row.table_name);
      });
      
      // Count users
      const userCount = await pool.query('SELECT COUNT(*) FROM auth_users');
      console.log('\n👥 Users in database:', userCount.rows[0].count);
      
      console.log('\n✅ DATABASE SCHEMA IS SET UP CORRECTLY!');
      console.log('   You can now use signup at http://localhost:4000/account/signup');
    } else {
      console.log('\n❌ NO TABLES FOUND - Schema not set up yet!');
      console.log('\n📝 To fix this:');
      console.log('   1. Go to https://console.neon.tech');
      console.log('   2. Open SQL Editor');
      console.log('   3. Copy all contents from database/schema.sql');
      console.log('   4. Paste and click Run');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('   - DATABASE_URL in .env is incorrect');
    console.log('   - Database not accessible');
    console.log('   - Schema not set up yet');
  } finally {
    await pool.end();
  }
}

checkSchema();
