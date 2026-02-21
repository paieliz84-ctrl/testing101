# Security Hardening Guide

Best practices untuk mengamankan aplikasi SvelteKit di production.

---

## 🔐 Authentication Security

### 1. Session Configuration

**Secure Cookie Settings:**
```typescript
// src/lib/auth/lucia.ts
export const createLucia = (adapter: any) => {
  return new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: true,           // HTTPS only
        httpOnly: true,         // No JavaScript access
        sameSite: 'strict',     // CSRF protection
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      }
    }
  });
};
```

**Session Rotation:**
```typescript
// hooks.server.ts
export const handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('auth_session');
  
  if (sessionId) {
    const { user, session } = await validateSession(sessionId);
    
    // Rotate session after 50% of lifetime
    if (session && session.fresh) {
      const newSession = await lucia.createSession(user.id, {});
      const cookie = lucia.createSessionCookie(newSession.id);
      event.cookies.set(cookie.name, cookie.value, cookie.attributes);
    }
  }
  
  return resolve(event);
};
```

---

### 2. Password Security

**Current Implementation (PBKDF2):**
```typescript
// src/lib/auth/password.ts
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // Increase in production
      hash: 'SHA-256'
    },
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    ),
    256
  );
  
  return `${bufferToHex(salt)}:${bufferToHex(key)}`;
}
```

**For Higher Security (Argon2 - if available):**
```typescript
// Note: Argon2 tidak tersedia di Cloudflare Workers
// Tetapi bisa digunakan di Node.js environment
import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64MB
    timeCost: 3,
    parallelism: 4
  });
}
```

**Password Requirements:**
```typescript
// Validation
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

---

### 3. Rate Limiting

**Implementasi Rate Limiting:**
```typescript
// src/lib/rate-limit.ts
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 5, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimits.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Usage in login endpoint
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const ip = getClientAddress();
  
  if (!checkRateLimit(ip, 5, 60000)) {
    throw error(429, { message: 'Too many requests. Try again later.' });
  }
  
  // ... login logic
};
```

**Cloudflare Rate Limiting (Recommended):**
```toml
# wrangler.toml
[[rules]]
path = "/auth/*"
methods = ["POST"]
rate_limit = { threshold = 5, period = 60 }
```

---

## 🛡️ Input Validation

### 1. Zod Schema Validation

**Strict Validation:**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .transform(val => val.toLowerCase().trim()),
  
  name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long')
    .regex(/^[\p{L}\s'-]+$/u, 'Invalid characters in name'),
  
  bio: z.string()
    .max(500, 'Bio too long')
    .transform(val => sanitizeHtml(val)) // Strip HTML
    .optional(),
  
  website: z.string()
    .url('Invalid URL')
    .refine(
      val => !val.includes('javascript:'),
      'Invalid protocol'
    )
    .optional()
});
```

### 2. SQL Injection Prevention

**Always Use ORM:**
```typescript
// ✅ SAFE: Drizzle escapes automatically
await db.select().from(users).where(eq(users.email, userInput));

// ❌ DANGEROUS: Never do this
await db.execute(`SELECT * FROM users WHERE email = '${userInput}'`);

// ✅ If must use raw SQL, use parameterized queries
await db.execute({
  sql: 'SELECT * FROM users WHERE email = ?',
  args: [userInput]
});
```

---

## 🌐 HTTP Security Headers

### 1. Security Headers Configuration

```typescript
// hooks.server.ts
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // Remove unsafe-inline jika bisa
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
};
```

### 2. Content Security Policy (Strict)

```typescript
// Production CSP
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Hanya allow inline scripts dengan nonce
    (req) => `'nonce-${req.locals.cspNonce}'`
  ],
  'style-src': ["'self'", "'unsafe-inline'"], // Tailwind butuh inline
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'https://api.yourservice.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': []
};
```

---

## 🔒 CSRF Protection

### 1. Double Submit Cookie Pattern

```typescript
// hooks.server.ts
import { randomBytes } from 'crypto';

export const handle = async ({ event, resolve }) => {
  // Generate CSRF token
  let csrfToken = event.cookies.get('csrf_token');
  if (!csrfToken) {
    csrfToken = randomBytes(32).toString('hex');
    event.cookies.set('csrf_token', csrfToken, {
      httpOnly: false, // Accessible by JS
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
  }
  
  // Validate on state-changing requests
  if (['POST', 'PUT', 'DELETE'].includes(event.request.method)) {
    const headerToken = event.request.headers.get('X-CSRF-Token');
    
    if (headerToken !== csrfToken) {
      throw error(403, { message: 'Invalid CSRF token' });
    }
  }
  
  event.locals.csrfToken = csrfToken;
  return resolve(event);
};
```

### 2. Form Actions (Built-in CSRF Protection)

```svelte
<!-- SvelteKit Form Actions sudah protected -->
<form method="POST" action="?/updateProfile">
  <!-- CSRF token auto-generated -->
  <button>Submit</button>
</form>
```

---

## 🗝️ Secret Management

### 1. Environment Variables

**Production Secrets:**
```bash
# .env.production (jangan commit!)
CLOUDFLARE_API_TOKEN=sk_live_xxxxxxxx
LUCIA_SECRET=random_32_char_string
ENCRYPTION_KEY=hex_64_char_key
```

**Generate Secrets:**
```bash
# Generate random secret
openssl rand -base64 32

# Generate hex key
openssl rand -hex 32
```

### 2. Cloudflare Secrets

```bash
# Store secrets securely
npx wrangler secret put LUCIA_SECRET
npx wrangler secret put ENCRYPTION_KEY
```

---

## 🚫 XSS Prevention

### 1. Output Encoding

**Automatic (Svelte):**
```svelte
<!-- ✅ Svelte auto-escapes -->
<p>{userInput}</p>

<!-- ❌ Hanya gunakan @html jika benar2 perlu -->
<p>{@html userInput}</p>
```

**Sanitization:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}
```

### 2. Trusted Types (Advanced)

```typescript
// Trusted Types Policy
if (typeof window !== 'undefined' && window.trustedTypes) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (input) => DOMPurify.sanitize(input),
    createScriptURL: () => '', // No dynamic scripts
    createScript: () => ''     // No dynamic scripts
  });
}
```

---

## 📋 Security Checklist

### Pre-Deployment

- [ ] HTTPS enforced (HSTS)
- [ ] Secure cookie attributes
- [ ] Rate limiting enabled
- [ ] Input validation strict
- [ ] Security headers configured
- [ ] CSP implemented
- [ ] Secrets not in code
- [ ] Error messages generic (no stack traces)

### Authentication

- [ ] Strong password requirements
- [ ] Account lockout after failed attempts
- [ ] Session timeout implemented
- [ ] Secure session storage
- [ ] CSRF protection enabled
- [ ] OAuth state parameter validated

### Data Protection

- [ ] Encryption at rest (D1 automatic)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Sensitive data masked in logs
- [ ] PII handling compliant (GDPR/CCPA)

### Monitoring

- [ ] Failed login attempts logged
- [ ] Suspicious activity alerts
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

---

## 🔍 Security Testing

### 1. Automated Scanning

```bash
# Dependency vulnerabilities
npm audit

# Web vulnerability scanner
npm install -g OWASP-ZAP
zap.sh -cmd -quickurl https://yoursite.com

# Security headers check
npx security-headers https://yoursite.com
```

### 2. Manual Testing

**Test Cases:**
- SQL Injection: `' OR '1'='1`
- XSS: `<script>alert(1)</script>`
- CSRF: Submit form tanpa token
- Rate Limit: Spam login attempts
- Auth Bypass: Access protected routes tanpa login

---

## 🚨 Incident Response

### Security Breach Response Plan

1. **Detect**
   - Monitor logs untuk suspicious activity
   - Set alerts untuk multiple failed logins

2. **Contain**
   - Revoke compromised sessions
   - Block suspicious IPs
   - Disable affected accounts

3. **Investigate**
   - Review access logs
   - Identify data yang diakses
   - Determine attack vector

4. **Recover**
   - Force password reset
   - Rotate secrets
   - Apply patches

5. **Learn**
   - Post-mortem analysis
   - Update security measures
   - Document lessons learned

---

**🔐 Remember: Security is a process, not a destination. Stay vigilant!**
