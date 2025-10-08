import sql from "@/app/api/utils/sql";
import argon2 from 'argon2';

export async function signupAction(formData) {
  'use server';
  
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const userType = formData.get('userType');

  if (!name || !email || !password || !userType) {
    return { error: 'Missing required fields' };
  }

  try {
    // Check if user already exists in auth_users
    const existingAuthUser = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (existingAuthUser.length > 0) {
      return { error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Create auth user first
    const [authUser] = await sql`
      INSERT INTO auth_users (name, email, "emailVerified")
      VALUES (${name}, ${email}, NULL)
      RETURNING id, name, email
    `;

    // Create auth account with password
    await sql`
      INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", password)
      VALUES (${authUser.id}, 'credentials', 'credentials', ${authUser.id}, ${passwordHash})
    `;

    // Create user in main users table for app data
    await sql`
      INSERT INTO users (name, email, phone, password_hash, user_type)
      VALUES (${name}, ${email}, ${phone || ''}, ${passwordHash}, ${userType})
    `;

    return { 
      success: true,
      message: 'Account created successfully'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { 
      error: 'Failed to create account: ' + error.message
    };
  }
}
