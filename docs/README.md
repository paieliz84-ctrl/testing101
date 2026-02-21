# 📚 Documentation

Dokumentasi SvelteKit Cloudflare D1 Boilerplate.

---

## 🚀 Getting Started

| Document | Description | Time |
|----------|-------------|------|
| [Quick Start](setup/quick-start.md) | Setup project dalam 5 menit | 5 min |
| [Environment Variables](setup/environment-variables.md) | Konfigurasi `.env` lengkap | 10 min |
| [Database Setup](setup/database.md) | Setup Cloudflare D1 | 15 min |
| [Deployment](deployment.md) | Deploy ke Cloudflare Pages | 10 min |

---

## 🛠️ Feature Guides

| Document | Description |
|----------|-------------|
| [Authentication](guides/authentication.md) | Login, register, Google OAuth |
| [File Uploads](guides/file-uploads.md) | Upload avatar & files ke R2 |

---

## 🛠️ Wrangler CLI

| Document | Description |
|----------|-------------|
| [Wrangler Commands](wrangler-commands.md) | Reference lengkap command CLI |

**Command Penting:**

```bash
# View production logs (real-time debugging)
npx wrangler pages deployment tail --project-name=layang-app --format=pretty

# Execute SQL di production
npx wrangler d1 execute DB --remote --command="SELECT * FROM users"

# Deploy
npm run deploy
```

---

## 🐛 Troubleshooting

| Document | Issues |
|----------|--------|
| [Deployment](troubleshooting/deployment.md) | Build errors, env vars, logs |
| [Common Issues](troubleshooting/common-issues.md) | Database, auth, file upload |

---

## 🏗️ Advanced

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System design & patterns |
| [API Reference](api-reference.md) | Complete API docs |
| [Security](security.md) | Hardening & best practices |
| [Customizing Schema](customizing-schema.md) | Modify database schema |

---

## 📖 External Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Wrangler Commands](https://developers.cloudflare.com/workers/wrangler/commands/)
