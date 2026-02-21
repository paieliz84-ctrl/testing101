import { json, error, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { generateId } from '$lib/auth/session';
import { sendEmail } from '$lib/email/resend';
import { generateVerificationEmail } from '$lib/email/templates/verification';

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: RequestHandler = async ({ request, locals, url }) => {
  try {
    // Get email from form data or JSON
    let email: string;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json() as { email?: string };
      email = body.email || '';
    } else {
      const formData = await request.formData();
      email = formData.get('email') as string;
    }
    
    if (!email) {
      throw error(400, { message: 'Email is required' });
    }
    
    // Find user
    const user = await locals.db
      .selectFrom('users')
      .where('email', '=', email)
      .select(['id', 'name', 'email_verified'])
      .executeTakeFirst();
    
    if (!user) {
      // Don't reveal if user exists
      return json({
        success: true,
        message: 'If an account exists, a verification email has been sent.'
      });
    }
    
    // Check if already verified
    if (user.email_verified) {
      return json({
        success: true,
        message: 'Email is already verified.'
      });
    }
    
    // Check for recent token (rate limiting - 1 minute)
    const oneMinuteAgo = Date.now() - 60 * 1000;
    const recentToken = await locals.db
      .selectFrom('email_verification_tokens')
      .where('user_id', '=', user.id)
      .where('created_at', '>', oneMinuteAgo)
      .select('id')
      .executeTakeFirst();
    
    if (recentToken) {
      throw error(429, { 
        message: 'Please wait a minute before requesting another email.' 
      });
    }
    
    // Generate new token
    const token = generateToken();
    const tokenHash = await hashToken(token);
    
    // Delete old unused tokens for this user
    await locals.db
      .deleteFrom('email_verification_tokens')
      .where('user_id', '=', user.id)
      .execute();
    
    // Create new token (expires in 24 hours)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
    await locals.db
      .insertInto('email_verification_tokens')
      .values({
        id: generateId(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: 0,
        created_at: Date.now()
      })
      .execute();
    
    // Generate verification URL
    const verificationUrl = `${url.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Send email
    const emailTemplate = generateVerificationEmail({
      name: user.name,
      verificationUrl,
      expiresIn: '24 hours'
    });
    
    const result = await sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: emailTemplate.html,
      text: emailTemplate.text
    });
    
    if (!result.success) {
      console.error('Failed to send verification email:', result.error);
      // Don't expose error to user for security
    }
    
    return json({
      success: true,
      message: 'If an account exists, a verification email has been sent.',
      // For development only
      ...(dev && {
        devLink: verificationUrl
      })
    });
    
  } catch (err: any) {
    console.error('Resend verification error:', err);
    
    if (err.status) throw err;
    
    throw error(500, { message: 'Failed to send verification email' });
  }
};
