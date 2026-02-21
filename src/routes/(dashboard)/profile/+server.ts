import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(160).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
  avatar: z.string().url().optional()
});

// GET /profile (API endpoint untuk AJAX/fetch)
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const user = await locals.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', locals.user.id)
      .executeTakeFirst();

    if (!user) {
      throw error(404, 'User not found');
    }

    return json({ user });
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    throw error(500, 'Failed to fetch profile');
  }
};

// PUT /profile (API endpoint untuk AJAX updates)
export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const body = await request.json();
    
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      throw error(400, { message: 'Invalid input', issues: result.error.issues });
    }

    const updateData: Record<string, unknown> = {
      updated_at: Date.now()
    };

    if (result.data.name !== undefined) updateData.name = result.data.name;
    if (result.data.bio !== undefined) updateData.bio = result.data.bio || null;
    if (result.data.location !== undefined) updateData.location = result.data.location || null;
    if (result.data.website !== undefined) updateData.website = result.data.website || null;
    if (result.data.avatar !== undefined) updateData.avatar = result.data.avatar;

    await locals.db
      .updateTable('users')
      .set(updateData)
      .where('id', '=', locals.user.id)
      .execute();

    const user = await locals.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', locals.user.id)
      .executeTakeFirst();

    return json({ user });
  } catch (err: any) {
    console.error('Failed to update profile:', err);
    throw error(500, err.message || 'Failed to update profile');
  }
};
