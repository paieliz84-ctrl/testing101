# Troubleshooting - Deployment Issues

Solusi untuk masalah deployment ke Cloudflare Pages.

> 📚 Lihat [Deployment Guide](../deployment.md) untuk panduan deploy lengkap.

---

## ❌ Build Failed

### Penyebab
- TypeScript errors
- Missing dependencies
- Import errors

### Solusi

1. Check local build:
```bash
npm run check    # Type check
npm run build    # Build test
```

2. Fix errors sebelum deploy

3. Check `svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: { adapter: adapter() }
};
```

---

## ❌ "D1 binding not found" (Production)

### Penyebab
- Database binding tidak diset di Pages Dashboard
- Variable name tidak match dengan `wrangler.toml`

### Solusi

1. Dashboard → Pages → Your Project
2. Settings → Functions → **Bindings**
3. Add D1 database binding:
   - **Variable name:** `DB` (harus sama dengan `wrangler.toml`)
   - **Database:** Pilih database Anda
4. **Redeploy** setelah set binding

Lihat detail di [Deployment Guide](../deployment.md#step-2-set-d1-database-binding-wajib-)

---

## ❌ Environment Variables tidak terbaca

### Penyebab
- Variables tidak di-set di Pages Dashboard
- Hanya di-set di local `.env`

### Solusi

1. Dashboard → Pages → Your Project
2. Settings → **Environment Variables**
3. Add all required variables untuk Production

**Note:** Environment variables di Cloudflare Pages terpisah dari local `.env`

---

## ❌ Google OAuth tidak work di production

### Penyebab
- Redirect URI belum didaftarkan untuk production domain

### Solusi

1. Google Cloud Console → Credentials
2. Edit OAuth 2.0 Client ID
3. Tambahkan redirect URI production:
   ```
   https://your-domain.pages.dev/auth/google/callback
   ```

---

## ❌ "This deployment does not exist"

### Penyebab
- Build belum selesai
- Deployment failed

### Solusi

1. Check build logs di Dashboard → Deployments
2. Fix errors
3. Re-deploy:
```bash
npm run deploy
# atau push commit baru
git commit --allow-empty -m "trigger redeploy"
git push
```

---

## ❌ Custom domain tidak work

### Penyebab
- DNS belum propagate
- SSL certificate pending

### Solusi

1. Dashboard → Pages → Your Project
4. Custom Domains
5. Check status:
   - 🟢 Active: Sudah beres
   - 🟠 Pending: Tunggu propagate (bisa 24-48 jam)

---

## 🔧 Debug Deployment

### Check Logs via Dashboard

Dashboard → Pages → Your Project → Functions tab → **Logs**

### Check Logs via CLI (Real-time)

```bash
# View real-time logs dari deployment production
npm run logs

# Atau langsung dengan wrangler
npx wrangler pages deployment tail --project-name=layang-app --format=pretty
```

**Gunakan ini untuk:**
- Debug error di production real-time
- Melihat `console.log` dari server functions
- Monitor traffic dan exceptions

Lihat [Wrangler Commands](../wrangler-commands.md) untuk command lengkap.

### Check Database Production

```bash
# Check tables
npx wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

# Check users
npx wrangler d1 execute DB --remote --command "SELECT email, name FROM users"
```

---

## 📋 Pre-deployment Checklist

Sebelum deploy, pastikan:

- [ ] `npm run build` berhasil
- [ ] `npm run check` 0 errors
- [ ] D1 database binding diset (Settings → Bindings)
- [ ] Environment variables di-set di dashboard
- [ ] Google OAuth redirect URI production sudah ditambah
- [ ] R2 bucket public (jika perlu file upload)

---

## 📞 Masih Bermasalah?

Check:
- [Deployment Guide](../deployment.md) - Panduan deploy lengkap
- [Common Issues](common-issues.md) - Masalah umum lainnya
- [Wrangler Commands](../wrangler-commands.md) - CLI reference
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
