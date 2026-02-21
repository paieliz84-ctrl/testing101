import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(160).optional().default(''),
  location: z.string().max(100).optional().default(''),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
});

export const load: PageServerLoad = async ({ locals }) => {
  // Check authentication
  if (!locals.user) {
    throw redirect(302, '/login');
  }

  // Fetch fresh user data from database
  const user = await locals.db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', locals.user.id)
    .executeTakeFirst();

  if (!user) {
    throw redirect(302, '/login');
  }

  return { user };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { error: 'Unauthorized' });
    }

    const formData = await request.formData();
    
    const result = updateProfileSchema.safeParse({
      name: formData.get('name'),
      bio: formData.get('bio'),
      location: formData.get('location'),
      website: formData.get('website'),
      avatar: formData.get('avatar') || undefined
    });

    if (!result.success) {
      return fail(400, {
        error: 'Validation failed',
        issues: result.error.issues
      });
    }

    try {
      await locals.db
        .updateTable('users')
        .set({
          name: result.data.name,
          bio: result.data.bio || null,
          location: result.data.location || null,
          website: result.data.website || null,
          ...(result.data.avatar ? { avatar: result.data.avatar } : {}),
          updated_at: Date.now()
        })
        .where('id', '=', locals.user.id)
        .execute();

      return { success: true };
    } catch (err) {
      console.error('Failed to update profile:', err);
      return fail(500, { error: 'Failed to update profile' });
    }
  }
};
