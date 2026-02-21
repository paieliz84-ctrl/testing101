import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // Check authentication
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // Fetch users for dashboard
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
    .limit(5)
    .execute();

  return {
    users,
    user: locals.user
  };
};
