import { json, error, type RequestHandler } from '@sveltejs/kit';
import { invalidateSession, createBlankSessionCookie, getSessionCookieName } from '$lib/auth/session';

export const POST: RequestHandler = async ({ locals, cookies, platform }) => {
	try {
		// Check if D1 binding exists
		if (!platform?.env.DB) {
			throw error(500, { message: 'Database not available' });
		}

		// Get session ID from cookie
		const sessionId = cookies.get(getSessionCookieName());

		if (!sessionId) {
			return json({ success: true, message: 'Already logged out' });
		}

		// Invalidate session
		await invalidateSession(locals.db, sessionId);

		// Create blank session cookie
		const blankCookie = createBlankSessionCookie();

		return json(
			{ success: true, message: 'Logout successful' },
			{
				headers: {
					'Set-Cookie': `${blankCookie.name}=${blankCookie.value}; Path=${blankCookie.attributes.path}; HttpOnly${blankCookie.attributes.secure ? '; Secure' : ''}; SameSite=${blankCookie.attributes.sameSite}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
				}
			}
		);
	} catch (err: any) {
		console.error('Logout error:', err);

		if (err.status) throw err;

		throw error(500, { message: 'Logout failed' });
	}
};
