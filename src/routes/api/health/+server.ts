import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const start = Date.now();
  
  // Test DB connection
  await locals.db
    .selectFrom('users')
    .select('id')
    .limit(1)
    .executeTakeFirst()
    .catch(() => null);
  
  return json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    latency: `${Date.now() - start}ms`,
    db: 'connected'
  });
};
