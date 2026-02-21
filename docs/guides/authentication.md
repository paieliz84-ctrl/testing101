# Authentication Guide

Panduan menggunakan sistem authentication di aplikasi.

---

## 🔐 Metode Login

Aplikasi mendukung 2 metode login:

1. **Email/Password** - Register dengan email dan password
2. **Google OAuth** - Login dengan satu klik menggunakan Google

---

## 📧 Email/Password Auth

### Register

1. Buka `/register`
2. Isi form:
   - Name (min 2 characters)
   - Email (valid format)
   - Password (min 8, 1 uppercase, 1 number)
3. Submit
4. Check email untuk verification link
5. Click link verifikasi
6. Login di `/login`

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Contoh valid: `MyP@ssw0rd123`

### Forgot Password

1. Klik "Forgot password?" di halaman login
2. Masukkan email
3. Check email untuk reset link
4. Klik link dan masukkan password baru
5. Login dengan password baru

### Email Verification

**Kenapa perlu verifikasi?**
- ✅ Mencegah spam accounts
- ✅ Memastikan email valid
- ✅ Bisa reset password

**Resend Verification:**
1. Login (jika email belum verified, akan diarahkan)
2. Klik "Resend verification email"
3. Check inbox/spam

---

## 🔵 Google OAuth

### Setup

Lihat konfigurasi di [Environment Variables](../setup/environment-variables.md#google-oauth-login-dengan-google)

### Login dengan Google

1. Buka `/login`
2. Klik "Continue with Google"
3. Pilih akun Google
4. Otomatis login dan redirect ke dashboard

**Keuntungan:**
- ⚡ Cepat - tidak perlu isi form
- 🔒 Aman - powered by Google security
- 📧 Otomatis verified - Google sudah verifikasi email

### Link Google ke Account Existing

Jika Anda sudah punya account dengan email yang sama:

1. Login dengan Google
2. Sistem akan link Google ke account existing
3. Next time bisa login dengan Google atau password

---

## 🛡️ Security Features

### Password Hashing

- **Algorithm:** PBKDF2-SHA256 (industry standard)
- **Salt:** Random 16 bytes
- **Iterations:** 100,000
- **Hash stored:** salt + derived key

```typescript
// src/lib/auth/password.ts
import { hashPassword, verifyPassword } from '$lib/auth/password';

const hash = await hashPassword('userPassword');
const isValid = await verifyPassword('userPassword', hash);
```

### Session Management

- **HTTP-only cookies** - Tidak bisa diakses JavaScript
- **Secure flag** - HTTPS only in production
- **SameSite: lax** - CSRF protection
- **Duration:** 30 days
- **Auto-refresh** - Extended saat aktif

```typescript
// src/lib/auth/session.ts
import { createSession, validateSession, invalidateSession } from '$lib/auth/session';

// Create session
const session = await createSession(db, userId);

// Validate
const { user, session } = await validateSession(db, sessionId);

// Invalidate (logout)
await invalidateSession(db, sessionId);
```

### CSRF Protection (OAuth)

```typescript
// src/lib/auth/google.ts
import { generateState, generateCodeVerifier } from '$lib/auth/google';

const state = generateState();      // For CSRF protection
const codeVerifier = generateCodeVerifier();  // PKCE
```

---

## 🐛 Troubleshooting Auth

| Masalah | Solusi |
|---------|--------|
| "Email already registered" | Gunakan email lain atau login |
| "Invalid email or password" | Check caps lock, atau reset password |
| "Email not verified" | Check inbox/spam untuk verification email |
| "Please use Google login" | Email ini dibuat via OAuth, login dengan Google |
| "redirect_uri_mismatch" | Tambahkan redirect URI di Google Cloud Console |
| Token expired | Minta reset password baru |
| Session tidak persist | Check browser cookie settings, allow third-party cookies |

Lihat juga [Common Issues](../troubleshooting/common-issues.md#authentication)

---

## 📁 Files Terkait

```
src/
├── lib/
│   └── auth/
│       ├── session.ts         # Session management (custom implementation)
│       ├── google.ts          # Google OAuth with PKCE
│       └── password.ts        # PBKDF2 password hashing
└── routes/
    ├── login/
    ├── register/
    ├── forgot-password/
    ├── reset-password/
    ├── profile/
    └── auth/
        ├── login/
        ├── register/
        ├── google/
        ├── logout/
        ├── forgot-password/
        ├── reset-password/
        └── verify-email/
```

---

## 📖 Lanjutan

- [Environment Variables](../setup/environment-variables.md) - Setup Google OAuth & Email
- [Common Issues](../troubleshooting/common-issues.md) - Troubleshooting
- [Wrangler Commands](../wrangler-commands.md) - Monitor production logs
