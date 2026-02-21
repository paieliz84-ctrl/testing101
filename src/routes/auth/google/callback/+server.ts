import { redirect, error, type RequestHandler } from '@sveltejs/kit';
import { createGoogleOAuthClient, getGoogleUserInfo } from '$lib/auth/google';
import { generateId, createSession, createSessionCookie } from '$lib/auth/session';

export const GET: RequestHandler = async ({ url, cookies, locals, platform }) => {
	try {
		// Check if D1 binding exists
		if (!platform?.env.DB) {
			throw error(500, { message: 'Database not available' });
		}

		const code = url.searchParams.get('code');
		const state = url.searchParams.get('state');
		const storedState = cookies.get('google_oauth_state');
		const codeVerifier = cookies.get('google_code_verifier');

		// Validate state to prevent CSRF
		if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
			throw error(400, { message: 'Invalid OAuth state' });
		}

		const google = createGoogleOAuthClient(url.origin);
		if (!google) {
			throw error(500, { message: 'Google OAuth not configured' });
		}

		// Exchange code for tokens
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);

		// Get user info from Google
		const googleUser = await getGoogleUserInfo(tokens.accessToken());

		if (!googleUser.email_verified) {
			throw error(400, { message: 'Google email not verified' });
		}

		// Check if user already exists by Google ID
		let user = await locals.db
			.selectFrom('users')
			.where('google_id', '=', googleUser.sub)
			.selectAll()
			.executeTakeFirst();

		// If not found by Google ID, check by email
		if (!user) {
			user = await locals.db
				.selectFrom('users')
				.where('email', '=', googleUser.email)
				.selectAll()
				.executeTakeFirst();

			if (user) {
				// Link Google account to existing user
				await locals.db
					.updateTable('users')
					.set({ google_id: googleUser.sub })
					.where('id', '=', user.id)
					.execute();
			}
		}

		// Create new user if not found
		let userId: string;
		if (!user) {
			userId = generateId();

			await locals.db
				.insertInto('users')
				.values({
					id: userId,
					email: googleUser.email,
					name: googleUser.name,
					google_id: googleUser.sub,
					provider: 'google',
					avatar: null, // Use default avatar instead of Google profile picture
					email_verified: 1,
					is_admin: 0,
					created_at: Date.now(),
					updated_at: Date.now()
				})
				.execute();
		} else {
			userId = user.id;
		}

		// Create session
		const session = await createSession(locals.db, userId);
		const sessionCookie = createSessionCookie(session.id);

		// Clean up OAuth cookies
		cookies.delete('google_oauth_state', { path: '/' });
		cookies.delete('google_code_verifier', { path: '/' });

		// Redirect to dashboard with session cookie
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/dashboard',
				'Set-Cookie': `${sessionCookie.name}=${sessionCookie.value}; Path=${sessionCookie.attributes.path}; HttpOnly${sessionCookie.attributes.secure ? '; Secure' : ''}; SameSite=${sessionCookie.attributes.sameSite}; Max-Age=${sessionCookie.attributes.maxAge}`
			}
		});
	} catch (err: any) {
		console.error('Google OAuth callback error:', err);

		if (err.status === 302) throw err;
		if (err.status === 400 || err.status === 500) throw err;

		// Redirect to login with error
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/login?error=google_auth_failed'
			}
		});
	}
};
