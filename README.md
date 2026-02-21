# 🪁 LayangKit

**Edge-first full-stack starter template** — SvelteKit + Cloudflare D1 + Drizzle ORM with authentication, email verification, and file uploads. Deployed on Cloudflare's edge network for maximum speed.

> 💰 **100% GRATIS untuk project kecil hingga menengah!** Semua layanan yang digunakan punya free tier yang sangat besar — bisa jalan bertahun-tahun tanpa keluar biaya sepeser pun.

![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0-orange?style=flat-square&logo=svelte)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔐 Authentication (Built-in)
- **Email/Password** - Secure registration & login with PBKDF2 password hashing (Web Crypto API)
- **Google OAuth** - One-click login with Google via Arctic
- **Email Verification** - Verify email addresses via Resend
- **Password Reset** - Complete forgot/reset password flow
- **Session Management** - Secure HTTP-only cookies with Lucia Auth 3.x

### 📁 File Uploads
- **Avatar Upload** - Profile picture with automatic WebP conversion
- **Presigned URLs** - Direct upload to Cloudflare R2 for large files
- **Image Processing** - Canvas API-based WebP conversion
- **CDN Delivery** - Fast global delivery via Cloudflare R2

### 🎨 UI/UX (Dark Elegance Theme)
- **Dark Mode Only** - Beautiful "Dark Elegance" theme with Tailwind CSS 4.x
- **Responsive** - Mobile-first design
- **Loading States** - Smooth transitions
- **Form Validation** - Server-side validation with Zod 4.x

### 🛠️ Tech Stack
| Category | Technology |
|----------|------------|
| Framework | [SvelteKit 2.x](https://kit.svelte.dev/) + [Svelte 5.x (Runes)](https://svelte.dev/) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| ORM | [Drizzle ORM 0.40](https://orm.drizzle.team/) |
| Auth | [Lucia 3.x](https://lucia-auth.com/) + [Arctic](https://arcticjs.dev/) |
| Password Hashing | Web Crypto API (PBKDF2) |
| Email | [Resend](https://resend.com/) |
| Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| Styling | [Tailwind CSS 4.x](https://tailwindcss.com/) |
| Icons | [Lucide](https://lucide.dev/) |
| Build | [Vite 6.x](https://vitejs.dev/) |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Quick Start](docs/setup/quick-start.md) | Setup dalam 5 menit |
| [Deployment](docs/deployment.md) | **Deploy ke Cloudflare Pages** 🚀 |
| [Environment Variables](docs/setup/environment-variables.md) | Konfigurasi `.env` lengkap |
| [Database Setup](docs/setup/database.md) | Setup Cloudflare D1 |
| [Wrangler Commands](docs/wrangler-commands.md) | CLI reference & monitoring |
| [Troubleshooting](docs/troubleshooting/) | Solusi masalah umum |
| [Architecture](docs/architecture.md) | System design |
| [API Reference](docs/api-reference.md) | API documentation |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- (Optional) Resend account for email
- (Optional) Google Cloud Console for OAuth

### ⚡ Super Cepat dengan `npm create layang`

Install dan setup project dalam 1 command:

```bash
npm create layang my-app
```

Command ini akan:
1. Membuat folder `my-app` dengan starter template
2. Install semua dependencies
3. Setup project siap pakai

Lanjut ke **Step 3** untuk setup database 👇

---

### 🔄 Cara Manual (Alternative)

Jika prefer clone manual:

```bash
# Clone the repository
git clone https://github.com/maulanashalihin/svelte-kit-cloudflare-starter.git my-app
cd my-app

# Install dependencies
npm install
```

### 3. Setup Database (wrangler.toml)

```bash
# 1. Login ke Cloudflare
npx wrangler login

# 2. Create D1 database
npx wrangler d1 create my-database

# 3. Copy database_id dari output ke wrangler.toml
```

Edit `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_id = "paste-database-id-here"  # ← Dari output command di atas
```

> 📖 **Perbedaan `wrangler.toml` vs `.env`:**
> - `wrangler.toml` = Bindings database/storage untuk aplikasi (WAJIB)
> - `.env` = Secrets untuk external services (OAuth, Email, dll) - OPSIONAL

### 4. Configure Environment (.env) - OPSIONAL

Copy dan edit untuk fitur tambahan:

```bash
cp .env.example .env
```

**Google OAuth** (untuk login dengan Google):
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Resend Email** (untuk email verification & reset password):
```env
RESEND_API_TOKEN=re_your_token
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com
```

**S3-Compatible Storage** (untuk file upload - R2, Wasabi, S3, dll):
```env
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_PUBLIC_URL=https://cdn.example.com
```

### 5. Generate & Apply Migrations

```bash
# Generate migrations from schema (run this first if drizzle/ folder is empty)
npm run db:generate

# Apply migrations to local database
npm run db:migrate:local

# Or apply to production database
npm run db:migrate
```

> **Note:** Run `db:generate` whenever you make changes to `src/lib/db/schema.ts`

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📚 Project Structure

```
.
├── src/
│   ├── lib/
│   │   ├── auth/           # Lucia auth, password hashing, Google OAuth
│   │   ├── db/             # Drizzle schema, types, client factory
│   │   ├── email/          # Resend email service & templates
│   │   ├── image/          # WebP image processing (Canvas API)
│   │   └── storage/        # R2 storage helpers & presigned URLs
│   ├── routes/
│   │   ├── auth/           # Auth API endpoints (login, register, etc)
│   │   ├── api/            # API endpoints (profile, users, upload)
│   │   ├── (examples)/     # Example patterns (server-load, form-actions)
│   │   ├── dashboard/      # Dashboard page (protected)
│   │   ├── profile/        # Profile page (protected)
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   └── ...
│   ├── hooks.server.ts     # Server hooks (DB + Auth injection)
│   ├── app.css             # Global styles (Tailwind 4)
│   └── app.html            # HTML template (dark theme)
├── drizzle/                # Database migrations
├── workflow/               # Workflow agents & documentation
├── scripts/                # Seed scripts
├── static/                 # Static assets
├── wrangler.toml           # Cloudflare config
└── package.json
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                  # Start dev server (Vite)
npm run check                # Type-check with svelte-check

# Building
npm run build                # Build for production
npm run preview              # Preview production build locally

# Database
npm run db:generate          # Generate migrations from schema.ts
npm run db:migrate:local     # Apply migrations to local D1
npm run db:migrate           # Apply migrations to production D1
npm run db:refresh:local     # Reset local DB + reapply migrations
npm run db:seed              # Seed database via HTTP API
npm run db:seed:local        # Execute seed.sql locally
npm run db:studio            # Open Drizzle Studio GUI

# Cloudflare
npm run cf:typegen           # Generate Cloudflare Workers types
npm run deploy               # Deploy to Cloudflare Pages
npm run logs                 # View production logs (real-time)
```

## 📖 Usage Guide

### Authentication Flow

1. **Register** - User registers with email/password
2. **Verify Email** - Verification email sent via Resend
3. **Click Link** - User clicks verification link (`/auth/verify-email?token=xxx`)
4. **Login** - User can now login (email must be verified)
5. **Google OAuth** - Alternative login via Google

### File Uploads

**For Images (with WebP conversion):**
```typescript
// POST /api/upload/image
const formData = new FormData();
formData.append('file', imageFile);
formData.append('type', 'avatar'); // 'avatar' | 'general'

const res = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
});

const { url } = await res.json();
// Returns WebP image URL on R2
```

**For Other Files (presigned URL):**
```typescript
// 1. Get presigned URL
const res = await fetch('/api/upload/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'document.pdf',
    contentType: 'application/pdf',
    prefix: 'documents'
  })
});

const { uploadUrl, publicUrl } = await res.json();

// 2. Upload directly to R2
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': 'application/pdf' }
});
```

### Server Load Pattern (Recommended)

```typescript
// routes/dashboard/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  // Query directly from server - no API needed!
  const users = await locals.db.query.users.findMany();
  return { users };
};
```

### Form Actions Pattern (Recommended)

```typescript
// routes/register/+page.server.ts
export const actions: Actions = {
  register: async ({ request, locals }) => {
    const form = await request.formData();
    // Validate, process, return result
    return { success: true };
  }
};
```

## 💰 Free Tier (Gratis!)

Proyek ini dibangun di atas stack **100% free tier** yang super besar:

| Layanan | Free Tier | Estimasi Penggunaan |
|---------|-----------|---------------------|
| **Cloudflare Pages** | Unlimited requests, 500 builds/bulan | Website unlimited traffic |
| **Cloudflare D1** | 500k rows/query per hari, 5 GB storage | Database 500rb query/hari |
| **Cloudflare R2** | 10 GB storage, 1 juta Class A ops/bulan | File storage 10 GB |
| **Workers (Functions)** | 100k requests/hari | API 100rb request/hari |
| **Resend** | 100 email/hari | Email verification 100/hari |

**Bottom line:** Untuk project kecil-menengah (startup, portfolio, side project), ini **GRATIS TOTAL** dengan limit yang sangat longgar. Bisa jalan bertahun-tahun tanpa biaya!

## 🌐 Deployment

### 1. Login & Deploy

```bash
# Login to Wrangler
npx wrangler login

# Deploy to Cloudflare Pages
npm run deploy
```

### 2. Bind D1 Database & R2 Bucket

Bindings sudah dikonfigurasi di `wrangler.toml`, tapi perlu di-bind di Dashboard:

Via Dashboard: **Pages** > Your Project > **Settings** > **Bindings**
- Bind D1 database dengan nama binding "DB"
- Bind R2 bucket dengan nama binding "STORAGE" (opsional)

### 3. Configure Environment Variables

Di Cloudflare Dashboard: **Pages** > Your Project > **Settings** > **Functions** > **Environment Variables**

Tambahkan secrets dari `.env` yang diperlukan:
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (jika pakai Google login)
- `RESEND_API_TOKEN` & `FROM_EMAIL` (jika pakai email)
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` (jika pakai upload)

## 🔒 Security Features

- ✅ **PBKDF2 Password Hashing** - Secure password storage with Web Crypto API
- ✅ **HTTP-only Cookies** - Session cookies can't be accessed via JavaScript
- ✅ **CSRF Protection** - State parameter in OAuth flow
- ✅ **Input Validation** - Zod 4.x validation on all inputs
- ✅ **SQL Injection Protection** - Via Drizzle ORM parameterized queries
- ✅ **Secure Headers** - Cloudflare Pages security headers

## 🐛 Troubleshooting

### "D1 binding not found"
Make sure `wrangler.toml` has correct `database_id` and you've created the database.

### "Email not sending"
Check `RESEND_API_TOKEN` and `FROM_EMAIL` environment variables. Verify email domain is verified in Resend.

### "Upload failed"
Verify R2 credentials and bucket name. Check browser console for detailed errors.

### "Build fails on Cloudflare"
Ensure all environment variables are set in Cloudflare Dashboard, not just locally.

See [docs/troubleshooting/](docs/troubleshooting/) for more solutions.

## 📖 References

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Lucia Auth](https://lucia-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

**Tepi Kilat** — *Cepat deploy ke edge, aman dengan auth built-in* ⚡

Built with ❤️ using [SvelteKit](https://kit.svelte.dev/) and [Cloudflare](https://cloudflare.com/)
