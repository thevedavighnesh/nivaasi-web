import { getToken } from '@auth/core/jwt';
import sql from '@/app/api/utils/sql';

export async function GET(request) {
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: process.env.AUTH_URL.startsWith('https'),
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: process.env.AUTH_URL.startsWith('https'),
		}),
	]);

	if (!jwt) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	// Fetch user_type from database
	const [user] = await sql`
		SELECT user_type FROM users WHERE id = ${jwt.sub}
	`;

	return new Response(
		JSON.stringify({
			jwt: token,
			user: {
				id: jwt.sub,
				email: jwt.email,
				name: jwt.name,
				user_type: user?.user_type || 'owner',
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
