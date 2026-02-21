# 🐛 Common Issues

Solusi cepat untuk masalah umum.

---

## 🔐 Authentication

### "Email already registered"
- Gunakan email lain, atau login jika sudah punya akun

### "Invalid email or password"
- Check caps lock, pastikan email benar
- Reset password via `/forgot-password`

### "Please verify your email"
- Check inbox/spam untuk verification email
- Resend dari profile page

### "redirect_uri_mismatch" (Google OAuth)
- Google Cloud Console → Credentials
- Tambahkan redirect URI:
  ```
  http://localhost:5173/auth/google/callback
  https://yourdomain.pages.dev/auth/google/callback
  ```

### Session tidak persist
- Check browser cookie settings
- Allow cookies untuk domain Anda

---

## 🗄️ Database

### "D1 binding not found"
```bash
# Check database exists
npx wrangler d1 list

# Check wrangler.toml
database_id = "paste-id-anda-disini"
```

### "Database not available"
```bash
# Apply migrations
npm run db:migrate:local
```

### "Migration failed"
```bash
# Reset local database
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

### "Permission denied"
- Buat API token baru dengan permission: Account → D1 → Edit

---

## 📁 File Upload

### "Storage not configured"
- Check `.env` R2 variables terisi
- Restart dev server setelah edit

### "Access Key ID does not exist"
- Buat API Token baru di R2 dashboard

### "NoSuchBucket"
- Check `R2_BUCKET_NAME` di `.env` (bukan URL)
- Pastikan bucket sudah dibuat

### Image tidak muncul
- Enable Public Access di bucket settings
- Check `R2_PUBLIC_URL` benar

---

## 🚀 Deployment

### "D1 binding not found" (Production)
- Dashboard → Pages → Settings → Functions → Bindings
- Add D1 binding dengan variable name `DB`

### Environment variables tidak terbaca
- Variables di Cloudflare Pages terpisah dari local `.env`
- Set di: Dashboard → Pages → Settings → Environment Variables

### "Build failed"
```bash
# Test build local
npm run check
npm run build
```

---

## 🔧 Quick Debug

### Check Logs Production
```bash
# Real-time logs
npx wrangler pages deployment tail --project-name=layang-app --format=pretty
```

### Check Database Production
```bash
npx wrangler d1 execute DB --remote --command="SELECT * FROM users"
```

### Check Health
```bash
curl http://localhost:5173/api/health
```

---

## 📚 Detail Lengkap

- [Deployment Issues](deployment.md) - Build errors, deployment
- [Wrangler Commands](../wrangler-commands.md) - CLI reference
