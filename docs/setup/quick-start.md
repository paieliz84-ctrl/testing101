# Quick Start - 5 Menit Setup

Setup project SvelteKit Cloudflare D1 dalam 5 menit.

---

## ✅ Prerequisites

- Node.js 18+ (check: `node --version`)
- npm atau pnpm
- Akun Cloudflare (gratis)

---

## 🚀 Langkah Setup

### ⚡ Cara Super Cepat (30 detik)

Gunakan `create-layang` CLI:

```bash
npm create layang my-app
```

Command ini otomatis:
- Clone template
- Install dependencies
- Setup project

Lanjut ke **Langkah 2** untuk setup database.

---

### 🔄 Cara Manual (Alternative)

Jika ingin clone manual:

#### 1. Clone & Install (1 menit)

```bash
# Clone repository
git clone https://github.com/yourusername/sveltekit-cf-d1-boilerplate.git
cd sveltekit-cf-d1-boilerplate

# Install dependencies
npm install
```

### 2. Setup Database D1 (2 menit)

```bash
# Login ke Wrangler (jika belum)
npx wrangler login

# Buat database D1
npx wrangler d1 create my-app-db

# Copy database_id yang muncul, contoh:
# database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

Edit `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "DB"
database_id = "paste-database-id-di-sini"  # <-- Ganti ini
```

### 3. Setup Environment Variables (OPSIONAL - 1 menit)

```bash
# Copy template untuk fitur tambahan
cp .env.example .env
```

**Tidak wajib diisi untuk development dasar.**

Isi `.env` hanya jika ingin mengaktifkan:

| Fitur | Variabel yang Diperlukan |
|-------|-------------------------|
| **Google Login** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Email Verification** | `RESEND_API_TOKEN`, `FROM_EMAIL` |
| **File Upload** | `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` |

Lihat [Environment Variables Lengkap](environment-variables.md) untuk detail setup.

### 4. Apply Database Migration (1 menit)

```bash
# Migration untuk local development
npm run db:migrate:local
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser: http://localhost:5173

---

## 🎉 Selesai!

Anda sekarang punya:
- ✅ SvelteKit app berjalan
- ✅ Database D1 terhubung
- ✅ Authentication system (register/login)
- ✅ Dashboard page

---

## 🔄 Next Steps

Tambahkan fitur opsional:

1. **Google Login** - Lihat [Environment Variables](environment-variables.md#google-oauth-login-dengan-google)
2. **Email Verification** - Lihat [Environment Variables](environment-variables.md#resend-email-email-verification)
3. **File Upload** - Lihat [Environment Variables](environment-variables.md#cloudflare-r2-file-upload)

---

## 🐛 Troubleshooting

| Error | Solusi |
|-------|--------|
| "D1 binding not found" | Check `wrangler.toml` database_id sudah benar, lalu jalankan `npm run db:migrate:local` |
| "Database not available" | Pastikan `database_id` di `wrangler.toml` sesuai dengan output `wrangler d1 create` |
| "Cannot find module" | Jalankan `npm install` ulang |
| "Google login error" | Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` diisi di `.env` |
| "Email not sending" | Pastikan `RESEND_API_TOKEN` dan `FROM_EMAIL` diisi di `.env` |

---

## 📖 Dokumentasi Lanjutan

- [Environment Variables Lengkap](environment-variables.md)
- [Database Setup Detail](database.md)
- [Authentication Guide](../guides/authentication.md)
- [Wrangler Commands](../wrangler-commands.md) - CLI reference
