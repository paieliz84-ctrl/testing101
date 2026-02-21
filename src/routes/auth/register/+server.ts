import { json, error, type RequestHandler } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { generateId } from '$lib/auth/session';
import { hashPassword } from '$lib/auth/password';
import { sendEmail } from '$lib/email/resend';
import { generateVerificationEmail } from '$lib/email/templates/verification';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

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

export const POST: RequestHandler = async ({ request, locals, platform, url }) => {
  try {
    // Check if D1 binding exists
    if (!platform?.env.DB) {
      throw error(500, { message: 'Database not available' });
    }

    const body = await request.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      throw error(400, { 
        message: 'Validation failed'
      });
    }

    const { email, name, password } = result.data;

    // Check if user already exists
    const existingUser = await locals.db
      .selectFrom('users')
      .where('email', '=', email)
      .select('id')
      .executeTakeFirst();

    if (existingUser) {
      throw error(409, { message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = generateId();

    // Create user (email_verified = 0 by default)
    await locals.db
      .insertInto('users')
      .values({
        id: userId,
        email,
        name,
        password_hash: passwordHash,
        provider: 'email',
        email_verified: 0,
        is_admin: 0,
        created_at: Date.now(),
        updated_at: Date.now()
      })
      .execute();

    // Generate verification token
    const token = generateToken();
    const tokenHash = await hashToken(token);

    // Create verification token (expires in 24 hours)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await locals.db
      .insertInto('email_verification_tokens')
      .values({
        id: generateId(),
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: 0,
        created_at: Date.now()
      })
      .execute();

    // Generate verification URL
    const verificationUrl = `${url.origin}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send verification email
    const emailTemplate = generateVerificationEmail({
      name,
      verificationUrl,
      expiresIn: '24 hours'
    });

    const emailResult = await sendEmail({
      to: email,
      subject: 'Verify your email address',
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email fails, just log it
      // In production, you might want to handle this differently
    }

    // Log verification link for development
    console.log('\n📧 Verification Email:');
    console.log('To:', email);
    console.log('Link:', verificationUrl);
    console.log('');

    return json(
      { 
        success: true, 
        message: 'Registration successful! Please check your email to verify your account.',
        user: { id: userId, email, name },
        // For development only
        ...(dev && {
          devLink: verificationUrl
        })
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Registration error:', err);
    
    if (err.status) throw err;
    
    throw error(500, { message: 'Registration failed' });
  }
};
