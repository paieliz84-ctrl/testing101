import type { PageServerLoad } from './$types';

// Hash token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const token = url.searchParams.get('token');
  const email = url.searchParams.get('email');
  
  // Validate required params
  if (!token || !email) {
    return {
      success: false,
      message: 'Invalid verification link. Missing token or email.'
    };
  }
  
  try {
    // Find user by email
    const user = await locals.db
      .selectFrom('users')
      .where('email', '=', email)
      .select(['id', 'email_verified'])
      .executeTakeFirst();
    
    if (!user) {
      return {
        success: false,
        message: 'User not found.'
      };
    }
    
    // Check if already verified
    if (user.email_verified) {
      return {
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified!'
      };
    }
    
    // Hash the provided token
    const tokenHash = await hashToken(token);
    
    // Find valid token
    const verificationToken = await locals.db
      .selectFrom('email_verification_tokens')
      .where('user_id', '=', user.id)
      .where('token_hash', '=', tokenHash)
      .where('used', '=', 0)
      .where('expires_at', '>', Date.now())
      .select('id')
      .executeTakeFirst();
    
    if (!verificationToken) {
      return {
        success: false,
        message: 'Invalid or expired verification link. Please request a new one.'
      };
    }
    
    // Mark email as verified
    await locals.db
      .updateTable('users')
      .set({ 
        email_verified: 1,
        updated_at: Date.now()
      })
      .where('id', '=', user.id)
      .execute();
    
    // Mark token as used
    await locals.db
      .updateTable('email_verification_tokens')
      .set({ used: 1 })
      .where('id', '=', verificationToken.id)
      .execute();
    
    return {
      success: true,
      message: 'Email verified successfully! You can now log in.'
    };
    
  } catch (err) {
    console.error('Email verification error:', err);
    return {
      success: false,
      message: 'An error occurred during verification. Please try again.'
    };
  }
};
