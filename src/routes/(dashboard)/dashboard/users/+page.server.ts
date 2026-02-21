import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // Check authentication
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // Fetch users directly from database (no client-side fetch needed)
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

  return {
    users,
    user: locals.user
  };
};
