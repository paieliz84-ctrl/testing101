import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';

// GET /dashboard/users (API endpoint untuk AJAX/fetch)
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const users = await locals.db
      .selectFrom('users')
      .select([
        'id',
        'email',
        'name',
        'provider',
        'email_verified',
        'avatar',
        'created_at'
      ])
      .orderBy('created_at', 'desc')
      .execute();

    return json({ success: true, data: users });
  } catch (err) {
    console.error('Failed to fetch users:', err);
    throw error(500, { message: 'Failed to fetch users' });
  }
};
