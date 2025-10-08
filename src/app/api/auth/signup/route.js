import sql from "@/app/api/utils/sql";
import argon2 from 'argon2';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, userType } = body;

    if (!name || !email || !password || !userType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists in auth_users
    const existingAuthUser = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;

    if (existingAuthUser.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
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

    return Response.json({ 
      message: 'Account created successfully',
      user: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        userType: userType
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ 
      error: 'Failed to create account',
      details: error.message 
    }, { status: 500 });
  }
}
