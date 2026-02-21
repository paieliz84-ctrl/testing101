export interface VerificationEmailData {
  name: string;
  verificationUrl: string;
  expiresIn: string;
}

export function generateVerificationEmail(data: VerificationEmailData): { html: string; text: string } {
  const { name, verificationUrl, expiresIn } = data;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #374151;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
    }
    .button:hover {
      opacity: 0.9;
    }
    .link-fallback {
      background-color: #f3f4f6;
      border-radius: 6px;
      padding: 15px;
      word-break: break-all;
      font-size: 14px;
      color: #6b7280;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      color: #9ca3af;
      font-size: 14px;
      margin: 0;
    }
    .expires {
      color: #ef4444;
      font-size: 14px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SvelteKit D1!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      
      <div class="button-container">
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <div class="link-fallback">
        ${verificationUrl}
      </div>
      
      <p class="expires">
        ⏰ This link will expire in ${expiresIn}.
      </p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} SvelteKit D1 Boilerplate. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
  
  const text = `
Hi ${name},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in ${expiresIn}.

If you didn't create an account, you can safely ignore this email.

Best regards,
SvelteKit D1 Boilerplate
  `;
  
  return { html, text };
}
