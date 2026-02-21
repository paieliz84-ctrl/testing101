import { Google } from 'arctic';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

/**
 * Create Google OAuth client
 * @param baseUrl - Request origin (e.g., 'http://localhost:5173' or 'https://example.com')
 * @returns Google OAuth client or null if credentials not configured
 */
export function createGoogleOAuthClient(baseUrl: string): Google | null {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('[Google OAuth] Credentials not configured');
    return null;
  }

  // Validate baseUrl
  try {
    const url = new URL(baseUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error(`Invalid protocol: ${url.protocol}`);
    }
  } catch {
    throw new Error(`Invalid baseUrl: ${baseUrl}`);
  }

  const redirectUri = `${baseUrl.replace(/\/$/, '')}/auth/google/callback`;

  return new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
}

/** Generate random state for OAuth CSRF protection */
export function generateState(): string {
  return crypto.randomUUID();
}

/** Generate PKCE code verifier */
export function generateCodeVerifier(): string {
  // PKCE code verifier: 43-128 chars, [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/** Base64URL encode for PKCE */
function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/** Google User Info response */
export interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Fetch Google user info
 * @param accessToken - OAuth access token
 * @throws Error if fetch fails
 */
export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('[Google OAuth] Failed to fetch user info:', response.status, errorText);
    throw new Error(`Failed to fetch Google user info: ${response.status}`);
  }

  return response.json();
}
