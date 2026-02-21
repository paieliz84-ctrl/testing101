import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // User sudah di-set di hooks.server.ts
  return {
    user: locals.user
  };
};
