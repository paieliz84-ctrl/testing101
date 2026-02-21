# Environment Variables & Configuration

Panduan konfigurasi untuk LayangKit. Ada **2 file konfigurasi** yang berbeda fungsi:

| File | Fungsi | Kapan Diperlukan |
|------|--------|------------------|
| `wrangler.toml` | Bindings database & storage | **WAJIB** - untuk aplikasi berjalan |
| `.env` | Secrets external services | Opsional - untuk fitur tambahan |

---

## 1. wrangler.toml (WAJIB)

File ini berisi **bindings** yang menghubungkan aplikasi dengan resources Cloudflare.

### Minimal Setup (D1 Database)

```toml
name = "my-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"                              # Nama di code: env.DB
database_name = "my-database"               # Nama di Cloudflare
database_id = "your-database-id-here"       # ← WAJIB GANTI!
migrations_dir = "migrations"
```

### Cara Setup:

```bash
# 1. Login
npx wrangler login

# 2. Create database
npx wrangler d1 create my-database

# 3. Copy database_id dari output ke wrangler.toml
# Output example:
# database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Optional: R2 Storage Binding

Untuk fitur file upload:

```toml
[[r2_buckets]]
binding = "STORAGE"                         # Nama di code: env.STORAGE
bucket_name = "my-app-storage"              # Nama bucket di R2
```

---

## 2. .env (OPSIONAL)

File ini berisi **secrets/credentials** untuk mengakses external services dari local development.

> **Catatan:** File `.env` **tidak di-deploy** ke Cloudflare. Untuk production, secrets di-set via Dashboard.

### A. Google OAuth (Untuk Login dengan Google)

```env
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
```

**Setup:**
1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create Credentials → OAuth client ID → Web application
3. Authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback`
   - `https://yourdomain.pages.dev/auth/google/callback`

### B. Resend Email (Untuk Email Verification & Reset Password)

```env
RESEND_API_TOKEN=re_xxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com
```

**Setup:**
1. Buat akun di [Resend](https://resend.com)
2. Dashboard → API Keys → Create API Key
3. (Opsional) Add domain untuk production
4. Untuk development, gunakan `onboarding@resend.dev`

### C. S3-Compatible Storage (Untuk File Upload)

**Support multiple providers:** Cloudflare R2, Wasabi, AWS S3, MinIO, DigitalOcean Spaces, dll.

**⚠️ Kenapa perlu credentials terpisah?**

Storage menggunakan **S3-compatible API** yang memerlukan `Access Key ID` & `Secret Access Key`. Ini berbeda dengan Cloudflare API Token dari `wrangler login`.

**Gunanya:**
- Generate **presigned URLs** → Upload file besar langsung dari browser ke storage
- Upload/delete file via S3 API tanpa melalui server

#### Cloudflare R2 (Default)
```env
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_r2_access_key
S3_SECRET_ACCESS_KEY=your_r2_secret_key
S3_PUBLIC_URL=https://pub-<hash>.r2.dev
S3_REGION=auto
```

**Setup:**
1. Dashboard → R2 → Create bucket
2. Settings → Public Access → Allow Access → Copy Public URL
3. Manage R2 API Tokens → Create API Token (Object Read & Write)
4. Copy Access Key ID dan Secret Access Key

#### Wasabi
```env
S3_ENDPOINT=https://s3.us-east-1.wasabisys.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_wasabi_key
S3_SECRET_ACCESS_KEY=your_wasabi_secret
S3_PUBLIC_URL=https://s3.us-east-1.wasabisys.com/my-bucket
S3_REGION=us-east-1
```

#### AWS S3
```env
S3_ENDPOINT=https://s3.ap-southeast-1.amazonaws.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_aws_key
S3_SECRET_ACCESS_KEY=your_aws_secret
S3_PUBLIC_URL=https://my-bucket.s3.ap-southeast-1.amazonaws.com
S3_REGION=ap-southeast-1
```

#### MinIO (Self-hosted)
```env
S3_ENDPOINT=http://localhost:9000
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_minio_key
S3_SECRET_ACCESS_KEY=your_minio_secret
S3_PUBLIC_URL=http://localhost:9000/my-bucket
S3_REGION=us-east-1
```

> **Catatan:** Untuk backward compatibility, variabel lama `R2_*` masih didukung.

---

## 3. Production Deployment

### Environment Variables di Cloudflare Pages

Untuk production, secrets di-set via Dashboard (bukan `.env`):

1. Dashboard → Pages → Your Project → Settings → Functions → Environment Variables
2. Add variables yang diperlukan:
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (jika pakai Google login)
   - `RESEND_API_TOKEN` & `FROM_EMAIL` (jika pakai email)
   - `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` (jika pakai upload)

### Bindings di Cloudflare Pages

Bindings (`wrangler.toml`) perlu di-bind manual di Dashboard:

1. Dashboard → Pages → Your Project → Settings → Bindings
2. D1 Database → Bind dengan nama "DB"
3. R2 Buckets → Bind dengan nama "STORAGE" (opsional)

---

## 4. Contoh Lengkap

### wrangler.toml
```toml
name = "my-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
migrations_dir = "migrations"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "my-app-storage"
```

### .env
```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx

# Resend Email
RESEND_API_TOKEN=re_xxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# S3 Storage (R2)
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=abc123...
S3_SECRET_ACCESS_KEY=xyz789...
S3_PUBLIC_URL=https://pub-abc123.r2.dev
```

---

## 5. Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "D1 binding not found" | `database_id` belum di-bind | Check Dashboard → Pages → Bindings |
| "Cannot query database" | `database_id` di `wrangler.toml` salah | Pastikan ID benar dari `wrangler d1 list` |
| "Storage not configured" | `.env` S3 credentials kosong | Isi `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` |
| "Email not sent" | `RESEND_API_TOKEN` salah | Verifikasi token di Resend dashboard |
| "Invalid OAuth redirect" | Redirect URI belum didaftarkan | Tambahkan di Google Cloud Console |

---

## 6. Ringkasan

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                                          │
├─────────────────────────────────────────────────────────────┤
│  wrangler.toml  →  Bind database/storage ke Workers        │
│  .env           →  Secrets untuk APIs (Google, Resend, R2) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CLOUDFLARE PAGES (PRODUCTION)                              │
├─────────────────────────────────────────────────────────────┤
│  Dashboard → Bindings  →  Bind D1 & R2                     │
│  Dashboard → Environment Variables  →  Secrets (.env)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Lanjutan

- [Quick Start](quick-start.md) - Setup 5 menit
- [Database Setup](database.md) - D1 configuration detail
- [Wrangler Commands](../wrangler-commands.md) - CLI reference
