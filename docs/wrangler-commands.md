# 🛠️ Wrangler Commands Reference

Referensi lengkap command Wrangler CLI untuk manage project Cloudflare.

---

## 📋 Prerequisites

```bash
# Login ke Cloudflare (satu kali saja)
npx wrangler login

# Status login
npx wrangler whoami
```

---

## 🗄️ D1 Database Commands

### Create & Manage Database

```bash
# Create database baru
npx wrangler d1 create DB

# List semua database
npx wrangler d1 list

# Info database
npx wrangler d1 info DB

# Delete database
npx wrangler d1 delete DB
```

### Execute SQL

```bash
# Execute command (local)
npx wrangler d1 execute DB --local --command="SELECT * FROM users"

# Execute command (production)
npx wrangler d1 execute DB --remote --command="SELECT * FROM users"

# Execute dari file SQL
npx wrangler d1 execute DB --local --file=./script.sql
npx wrangler d1 execute DB --remote --file=./script.sql
```

### Migrations

```bash
# Apply migrations (local)
npx wrangler d1 migrations apply DB --local

# Apply migrations (production)
npx wrangler d1 migrations apply DB --remote

# List migrations
npx wrangler d1 migrations list DB
```

### Backup & Export

```bash
# Export database ke SQL file
npx wrangler d1 export DB --local --output=./backup.sql
npx wrangler d1 export DB --remote --output=./backup.sql

# Export specific table
sqlite3 .wrangler/state/v3/d1/xxx.sqlite ".dump users" > users_backup.sql
```

---

## 📄 Pages Commands

### Development

```bash
# Dev server dengan binding
npx wrangler pages dev .svelte-kit/cloudflare --binding DB

# Dev dengan port custom
npx wrangler pages dev .svelte-kit/cloudflare --port 3000
```

### Deployment

```bash
# Deploy ke Cloudflare Pages
npm run deploy
# atau
npx wrangler pages deploy .svelte-kit/cloudflare

# Deploy dengan production branch
npx wrangler pages deploy .svelte-kit/cloudflare --branch=main
```

### 🔔 Monitoring & Logs (IMPORTANT)

```bash
# View real-time logs dari deployment production
npx wrangler pages deployment tail --project-name=layang-app --format=pretty

# Simpan logs ke file
npx wrangler pages deployment tail --project-name=layang-app --format=pretty 2>&1 | tee logs.txt

# List deployments
npx wrangler pages deployment list --project-name=layang-app
```

**Gunakan ini untuk:**
- Debug error di production
- Monitor traffic real-time
- Melihat console.log dari functions

---

## 🪣 R2 Storage Commands

```bash
# Create bucket
npx wrangler r2 bucket create my-bucket

# List buckets
npx wrangler r2 bucket list

# Delete bucket
npx wrangler r2 bucket delete my-bucket

# Upload file
npx wrangler r2 object put my-bucket/file.txt --file=./local-file.txt

# Download file
npx wrangler r2 object get my-bucket/file.txt --file=./downloaded.txt

# List objects
npx wrangler r2 object list my-bucket

# Delete object
npx wrangler r2 object delete my-bucket/file.txt
```

---

## 🔑 Secrets & Variables

```bash
# Set secret (untuk Workers)
npx wrangler secret put MY_SECRET

# List secrets
npx wrangler secret list

# Delete secret
npx wrangler secret delete MY_SECRET
```

---

## 🌐 KV (Key-Value Store)

```bash
# Create namespace
npx wrangler kv:namespace create MY_KV

# List namespaces
npx wrangler kv:namespace list

# Put key-value
npx wrangler kv:key put --binding=MY_KV "key" "value"

# Get value
npx wrangler kv:key get --binding=MY_KV "key"

# Delete key
npx wrangler kv:key delete --binding=MY_KV "key"

# List keys
npx wrangler kv:key list --binding=MY_KV
```

---

## 📊 Common Workflows

### Reset Local Database

```bash
rm -rf .wrangler/state/v3/d1
npm run db:migrate:local
```

### Debug Production Issue

```bash
# 1. Tail logs real-time
npx wrangler pages deployment tail --project-name=layang-app --format=pretty

# 2. Check database di production
npx wrangler d1 execute DB --remote --command="SELECT * FROM users WHERE email='test@test.com'"

# 3. Verify environment variables
npx wrangler pages deployment list --project-name=layang-app
```

### Full Deploy Workflow

```bash
# 1. Type check
npm run check

# 2. Build
npm run build

# 3. Apply migrations (if needed)
npm run db:migrate

# 4. Deploy
npm run deploy

# 5. Monitor logs
npx wrangler pages deployment tail --project-name=layang-app --format=pretty
```

---

## 📖 Resources

- [Wrangler Commands Docs](https://developers.cloudflare.com/workers/wrangler/commands/)
- [D1 Wrangler Commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Pages Commands](https://developers.cloudflare.com/pages/platform/wrangler-configuration/)
