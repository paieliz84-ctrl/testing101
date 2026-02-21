# 🚀 Deployment Guide

Deploy aplikasi SvelteKit ke Cloudflare Pages.

---

## 🎯 Pilih Cara Deploy

Ada **2 cara** deploy:

| Cara | Waktu | Auto-setup | Dashboard |
|------|-------|------------|-----------|
| **Otomasi CLI** ⭐ | 2 menit | ✅ Otomatis | ❌ Tidak perlu |
| **Manual Dashboard** | 10 menit | ❌ Manual | ✅ Via UI |

**Rekomendasi:** Gunakan **Otomasi CLI** untuk lebih cepat!

---

## Cara 1: Otomasi CLI (2 Menit) ⭐

Deploy + konfigurasi sepenuhnya via CLI tanpa buka dashboard.

### Prerequisites

```bash
# Login ke Cloudflare (satu kali)
npx wrangler login

# Pastikan build berhasil
npm run build
```

### Step-by-Step

#### 1. Deploy Aplikasi

```bash
npm run deploy
```

Output:
```
✨ Successfully deployed to https://my-app.pages.dev
```

#### 2. Configure D1 Binding (WAJIB)

```bash
# Tambahkan D1 binding
npx wrangler pages bindings add d1 \
  --project-name=my-app \
  --binding=DB \
  --database=my-database
```

#### 3. Set Environment Variables

```bash
# Email (Resend)
npx wrangler pages secret put RESEND_API_TOKEN --project-name=my-app
# Enter value: re_your_token

npx wrangler pages secret put FROM_EMAIL --project-name=my-app
# Enter value: noreply@yourdomain.com

# S3 Storage (jika pakai file upload)
npx wrangler pages secret put S3_ENDPOINT --project-name=my-app
npx wrangler pages secret put S3_ACCESS_KEY_ID --project-name=my-app
npx wrangler pages secret put S3_SECRET_ACCESS_KEY --project-name=my-app
npx wrangler pages secret put S3_BUCKET_NAME --project-name=my-app

# Google OAuth (opsional)
npx wrangler pages secret put GOOGLE_CLIENT_ID --project-name=my-app
npx wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name=my-app
```

#### 4. Apply Database Migrations

```bash
npm run db:migrate
```

#### 5. Verify

```bash
curl https://my-app.pages.dev/api/health
```

🎉 **Selesai!** Aplikasi live tanpa buka dashboard!

---

## Cara 2: Manual Dashboard

Jika otomasi CLI bermasalah, gunakan cara manual via Dashboard.

### Step 1: Connect GitHub (Git Integration)

1. [Dashboard](https://dash.cloudflare.com) → Workers & Pages → **Create**
2. **Pages** → **Connect to Git**
3. Pilih repository
4. Configure:
   - **Project name:** `my-app`
   - **Production branch:** `main`
   - **Framework:** `SvelteKit`
   - **Build command:** `npm run build`
   - **Output:** `.svelte-kit/cloudflare`
5. **Save and Deploy**

### Step 2: Set D1 Binding (WAJIB)

1. Project → **Settings** → **Bindings**
2. Add **D1 database binding**:
   - Variable name: `DB`
   - Database: pilih database
3. **Save**

### Step 3: Set Environment Variables

1. Settings → **Environment variables**
2. Add variables:

```
RESEND_API_TOKEN=re_xxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
S3_ENDPOINT=https://xxx.r2.cloudfloreststorage.com
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=xxx
```

### Step 4: Redeploy

```bash
git commit --allow-empty -m "trigger deploy"
git push
```

---

## 🔄 Update Deployment

### Via CLI (Cepat)

```bash
npm run build
npm run deploy
```

### Via Git (Auto-deploy)

```bash
git add .
git commit -m "update"
git push
```

---

## 🗄️ Production Database

### Apply Migration

```bash
npm run db:migrate
```

### Verify Database

```bash
npx wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🌐 Custom Domain

1. Dashboard → Pages → Project → **Custom domains**
2. **Set up** → Enter domain → Follow DNS setup

---

## 🛠️ Troubleshooting

### "D1 binding not found"

```bash
# Cek binding
npx wrangler pages bindings list --project-name=my-app

# Tambahkan
npx wrangler pages bindings add d1 --project-name=my-app --binding=DB --database=my-database
```

### "Missing environment variable"

```bash
npx wrangler pages secret put <VARIABLE_NAME> --project-name=my-app
```

### Error 500

- Check D1 binding
- Check environment variables
- Check logs: `npm run logs`

---

## 📋 Commands Reference

```bash
# Deploy
npm run deploy

# Set secret
npx wrangler pages secret put <NAME> --project-name=my-app

# List secrets
npx wrangler pages secret list --project-name=my-app

# View logs
npm run logs

# Database migrate
npm run db:migrate

# Execute SQL
npx wrangler d1 execute DB --remote --command "SELECT * FROM users"
```

---

## 🎉 Deployment Complete!

Aplikasi sudah live di edge! 🚀
