import { Resend } from 'resend';

// Resend client initialization
// In production, API token comes from environment variables
const RESEND_API_TOKEN = process.env.RESEND_API_TOKEN || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL; // Optional: real inbox for replies

let resend: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!RESEND_API_TOKEN) {
    console.warn('RESEND_API_TOKEN not configured');
    return null;
  }
  
  if (!resend) {
    resend = new Resend(RESEND_API_TOKEN);
  }
  
  return resend;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string; // Custom reply-to address
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const client = getResendClient();
  
  if (!client) {
    return { 
      success: false, 
      error: 'Email service not configured' 
    };
  }
  
  try {
    const { data, error } = await client.emails.send({
      from: options.from || FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo : options.replyTo || REPLY_TO_EMAIL,
    });
    
    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Email sent successfully:', data?.id);
    return { success: true };
    
  } catch (err: any) {
    console.error('Send email error:', err);
    return { success: false, error: err.message };
  }
}

// Helper to check if email service is configured
export function isEmailConfigured(): boolean {
  return !!RESEND_API_TOKEN && !!FROM_EMAIL;
}
