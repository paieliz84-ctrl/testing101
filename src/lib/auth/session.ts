import { dev } from '$app/environment';
import type { Kysely } from 'kysely';
import type { Database } from '$lib/db';

// Session duration: 30 days (in milliseconds)
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

// Cookie name
const SESSION_COOKIE_NAME = 'auth_session';

// Cookie attributes
const COOKIE_ATTRIBUTES = {
	httpOnly: true,
	secure: !dev,
	sameSite: 'lax' as const,
	path: '/',
	maxAge: SESSION_DURATION / 1000 // in seconds
};

// User attributes yang akan di-return dari session
export interface SessionUser {
	id: string;
	email: string;
	name: string;
	provider: 'email' | 'google';
	avatar: string | null;
	createdAt: number;
}

// Session interface
export interface Session {
	id: string;
	userId: string;
	expiresAt: number;
	fresh: boolean; // true if session was just created or refreshed
}

// Cookie interface
export interface SessionCookie {
	name: string;
	value: string;
	attributes: {
		httpOnly: boolean;
		secure: boolean;
		sameSite: 'lax' | 'strict' | 'none';
		path: string;
		maxAge?: number;
		expires?: Date;
	};
}

/**
 * Generate random ID (UUID v4)
 */
export function generateId(): string {
	return crypto.randomUUID();
}

/**
 * Generate secure random token
 */
export function generateSessionToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create new session for user
 */
export async function createSession(
	db: Kysely<Database>,
	userId: string
): Promise<Session> {
	const sessionId = generateSessionToken();
	const expiresAt = Date.now() + SESSION_DURATION;

	await db
		.insertInto('sessions')
		.values({
			id: sessionId,
			user_id: userId,
			expires_at: expiresAt
		})
		.execute();

	return {
		id: sessionId,
		userId,
		expiresAt,
		fresh: true
	};
}

/**
 * Validate session by ID
 * Returns user and session if valid, null otherwise
 */
export async function validateSession(
	db: Kysely<Database>,
	sessionId: string
): Promise<{ user: SessionUser | null; session: Session | null }> {
	if (!sessionId) {
		return { user: null, session: null };
	}

	try {
		// Get session with user data using join
		const result = await db
			.selectFrom('sessions')
			.innerJoin('users', 'sessions.user_id', 'users.id')
			.where('sessions.id', '=', sessionId)
			.select([
				'sessions.id as session_id',
				'sessions.user_id',
				'sessions.expires_at',
				'users.id as user_id',
				'users.email',
				'users.name',
				'users.provider',
				'users.avatar',
				'users.created_at'
			])
			.executeTakeFirst();

		if (!result) {
			return { user: null, session: null };
		}

		// Check if session expired
		if (Date.now() > result.expires_at) {
			// Delete expired session
			await db
				.deleteFrom('sessions')
				.where('id', '=', sessionId)
				.execute();
			return { user: null, session: null };
		}

		// Check if session needs refresh (expires in less than 15 days)
		const fifteenDays = 15 * 24 * 60 * 60 * 1000;
		let fresh = false;

		if (result.expires_at - Date.now() < fifteenDays) {
			// Extend session
			const newExpiresAt = Date.now() + SESSION_DURATION;
			await db
				.updateTable('sessions')
				.set({ expires_at: newExpiresAt })
				.where('id', '=', sessionId)
				.execute();
			result.expires_at = newExpiresAt;
			fresh = true;
		}

		const user: SessionUser = {
			id: result.user_id,
			email: result.email,
			name: result.name,
			provider: result.provider as 'email' | 'google',
			avatar: result.avatar ?? null,
			createdAt: result.created_at ?? Date.now()
		};

		const session: Session = {
			id: result.session_id,
			userId: result.user_id,
			expiresAt: result.expires_at,
			fresh
		};

		return { user, session };
	} catch (error) {
		console.error('Session validation error:', error);
		return { user: null, session: null };
	}
}

/**
 * Invalidate (delete) session
 */
export async function invalidateSession(
	db: Kysely<Database>,
	sessionId: string
): Promise<void> {
	if (!sessionId) return;

	try {
		await db
			.deleteFrom('sessions')
			.where('id', '=', sessionId)
			.execute();
	} catch (error) {
		console.error('Session invalidation error:', error);
	}
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateUserSessions(
	db: Kysely<Database>,
	userId: string
): Promise<void> {
	try {
		await db
			.deleteFrom('sessions')
			.where('user_id', '=', userId)
			.execute();
	} catch (error) {
		console.error('User sessions invalidation error:', error);
	}
}

/**
 * Create session cookie
 */
export function createSessionCookie(sessionId: string): SessionCookie {
	return {
		name: SESSION_COOKIE_NAME,
		value: sessionId,
		attributes: {
			...COOKIE_ATTRIBUTES,
			maxAge: SESSION_DURATION / 1000
		}
	};
}

/**
 * Create blank session cookie (for logout)
 */
export function createBlankSessionCookie(): SessionCookie {
	return {
		name: SESSION_COOKIE_NAME,
		value: '',
		attributes: {
			...COOKIE_ATTRIBUTES,
			maxAge: 0,
			expires: new Date(0)
		}
	};
}

/**
 * Get session cookie name
 */
export function getSessionCookieName(): string {
	return SESSION_COOKIE_NAME;
}

/**
 * Serialize cookie for Set-Cookie header
 */
export function serializeCookie(cookie: SessionCookie): string {
	const { name, value, attributes } = cookie;

	let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	if (attributes.path) {
		cookieString += `; Path=${attributes.path}`;
	}

	if (attributes.httpOnly) {
		cookieString += '; HttpOnly';
	}

	if (attributes.secure) {
		cookieString += '; Secure';
	}

	if (attributes.sameSite) {
		cookieString += `; SameSite=${attributes.sameSite}`;
	}

	if (attributes.maxAge !== undefined) {
		cookieString += `; Max-Age=${attributes.maxAge}`;
	}

	if (attributes.expires) {
		cookieString += `; Expires=${attributes.expires.toUTCString()}`;
	}

	return cookieString;
}
