import { redirect, error, type RequestHandler } from '@sveltejs/kit';
import { createGoogleOAuthClient, generateState, generateCodeVerifier } from '$lib/auth/google';

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    const google = createGoogleOAuthClient(url.origin);
    
    if (!google) {
      throw error(500, { message: 'Google OAuth not configured' });
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    
    // Generate authorization URL with PKCE
    const authUrl = await google.createAuthorizationURL(state, codeVerifier, [
      'openid', 'email', 'profile'
    ]);

    // Store state and code verifier in cookies (for verification in callback)
    cookies.set('google_oauth_state', state, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      secure: import.meta.env.PROD
    });
    
    cookies.set('google_code_verifier', codeVerifier, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 10, // 10 minutes
      secure: import.meta.env.PROD
    });

    // Redirect to Google OAuth
    throw redirect(302, authUrl.toString());

  } catch (err: any) {
    if (err.status === 302) throw err;
    
    console.error('Google OAuth init error:', err);
    throw error(500, { message: 'Failed to initialize Google OAuth' });
  }
};
