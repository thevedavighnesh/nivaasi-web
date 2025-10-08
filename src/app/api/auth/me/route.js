import { getToken } from '@auth/core/jwt';
import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https'),
    });

    if (!jwt) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch full user details from database
    const [user] = await sql`
      SELECT id, name, email, phone, user_type, profile_image_url, created_at
      FROM users
      WHERE id = ${jwt.sub}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
