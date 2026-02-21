import { json, error, type RequestHandler } from '@sveltejs/kit';
import { verifyPassword } from '$lib/auth/password';
import { createSession, createSessionCookie } from '$lib/auth/session';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	try {
		// Check if D1 binding exists
		if (!platform?.env.DB) {
			throw error(500, { message: 'Database not available' });
		}

		const body = await request.json();

		// Validate input
		const result = loginSchema.safeParse(body);
		if (!result.success) {
			throw error(400, {
				message: 'Validation failed'
			});
		}

		const { email, password } = result.data;

		// Find user by email
		const user = await locals.db
			.selectFrom('users')
			.where('email', '=', email)
			.selectAll()
			.executeTakeFirst();

		if (!user) {
			throw error(401, { message: 'Invalid email or password' });
		}

		// Check if user has password (OAuth users might not have one)
		if (!user.password_hash) {
			throw error(401, {
				message: 'Please use Google login for this account'
			});
		}

		// Verify password
		const validPassword = await verifyPassword(password, user.password_hash);

		if (!validPassword) {
			throw error(401, { message: 'Invalid email or password' });
		}

		// Check if email is verified
		if (!user.email_verified) {
			throw error(403, {
				message: 'Please verify your email before logging in. Check your inbox or request a new verification email.'
			});
		}

		// Create session
		const session = await createSession(locals.db, user.id);
		const sessionCookie = createSessionCookie(session.id);

		return json(
			{
				success: true,
				message: 'Login successful',
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					provider: user.provider
				}
			},
			{
				headers: {
					'Set-Cookie': `${sessionCookie.name}=${sessionCookie.value}; Path=${sessionCookie.attributes.path}; HttpOnly${sessionCookie.attributes.secure ? '; Secure' : ''}; SameSite=${sessionCookie.attributes.sameSite}; Max-Age=${sessionCookie.attributes.maxAge}`
				}
			}
		);
	} catch (err: any) {
		console.error('Login error:', err);

		if (err.status) throw err;

		throw error(500, { message: 'Login failed' });
	}
};
