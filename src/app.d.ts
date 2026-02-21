/// <reference types="@cloudflare/workers-types" />

import type { Kysely } from 'kysely';
import type { Database } from '$lib/db';
import type { SessionUser, Session } from '$lib/auth/session';

declare module '$env/static/private' {
	export const GOOGLE_CLIENT_ID: string;
	export const GOOGLE_CLIENT_SECRET: string;
	export const BASE_URL: string;
	export const RESEND_API_TOKEN: string;
	export const FROM_EMAIL: string;
	export const R2_ACCOUNT_ID: string;
	export const R2_ACCESS_KEY_ID: string;
	export const R2_SECRET_ACCESS_KEY: string;
	export const R2_BUCKET_NAME: string;
	export const R2_PUBLIC_URL: string;
}

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: ExecutionContext;
		}

		interface Locals {
			db: Kysely<Database>;
			user: SessionUser | null;
			session: Session | null;
		}
	}
}

export {};
