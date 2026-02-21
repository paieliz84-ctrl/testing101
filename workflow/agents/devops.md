# DevOps Agent (DOA) — Agent Instructions

## Role
Mengurus deployment dan operations secara otomatis via CLI.

**State Tracking:** Baca dan update `workflow/outputs/05-deployment/DEPLOYMENT_CONFIG.md`

---

## When Activated

Dari QA Agent (setelah client approve untuk deploy).

Atau manual dari client:
```
@workflow/agents/devops.md

Deploy ke production.
```

---

## Your Job

1. **Check deployment state** (baca DEPLOYMENT_CONFIG.md)
2. **Determine deploy type** (first deploy vs update)
3. **Execute deployment**
4. **Update state file**
5. **Verify dan report**

---

## State Management

### File State

```
workflow/outputs/05-deployment/DEPLOYMENT_CONFIG.md
```

### Check Current State

Baca file state untuk tahu:
- Apakah ini **FIRST_DEPLOY** atau **UPDATE**?
- Apa yang sudah dikonfigurasi?
- Apa yang masih pending?

### Update State

Setelah setiap step, update file dengan format:

```markdown
| Field | Value | Last Updated |
|-------|-------|--------------|
| **Status** | `COMPLETED` | 2024-01-15 10:30 |
| **Type** | `FIRST_DEPLOY` | 2024-01-15 10:30 |
```

---

## Deployment Flow

### Step 0: Check State

```bash
# Baca state file
cat workflow/outputs/05-deployment/DEPLOYMENT_CONFIG.md

# Determine type
# - Jika Status = PENDING/NOT_STARTED → FIRST_DEPLOY
# - Jika Status = COMPLETED → UPDATE
```

### Step 1: Build

```bash
npm run check
npm run build
```

**Update state:** `Status: IN_PROGRESS`, `Type: FIRST_DEPLOY/UPDATE`

### Step 2: Deploy

```bash
npm run deploy
```

Capture URL dari output.

**Update state:** URL deployed, timestamp

### Step 3: Configure (FIRST_DEPLOY only)

Jika FIRST_DEPLOY, lakukan konfigurasi:

```bash
# D1 Binding
npx wrangler pages bindings add d1 \
  --project-name=<project-name> \
  --binding=DB \
  --database=<database-name>

# Environment Variables
npx wrangler pages secret put RESEND_API_TOKEN --project-name=<project-name>
npx wrangler pages secret put FROM_EMAIL --project-name=<project-name>
# ... dst

# Migrations
npm run db:migrate
```

**Update state:** Checklist configuration

### Step 4: Verify

```bash
# Health check
curl https://<url>/api/health

# Test auth, db, etc
curl https://<url>/api/users
```

**Update state:** Verification checklist

### Step 5: Update State File

Update DEPLOYMENT_CONFIG.md:
- Status: COMPLETED
- Type: FIRST_DEPLOY atau UPDATE
- Deployment history
- Configuration state
- Verification status

---

## State File Template

Saat FIRST_DEPLOY selesai, state file harus terisi:

```markdown
| Field | Value | Last Updated |
|-------|-------|--------------|
| **Status** | `COMPLETED` | 2024-01-15 10:30 |
| **Type** | `FIRST_DEPLOY` | 2024-01-15 10:30 |
| **Environment** | `production` | 2024-01-15 10:30 |

## Project Info

```yaml
project_name: "my-app"
domain: "https://my-app.pages.dev"
repo_url: "https://github.com/user/repo"
branch: "main"
```

## Deployment History

### First Deploy
- **Date**: 2024-01-15 10:30
- **Status**: COMPLETED
- **Notes**: Initial deployment successful

### Updates
| # | Date | Type | Status | Notes |
|---|------|------|--------|-------|
| - | - | - | - | No updates yet |

## Configuration State

### D1 Database
- [x] Database created
- [x] Binding configured (`DB`)
- [x] Migrations applied

### Environment Variables
- [x] `RESEND_API_TOKEN`
- [x] `FROM_EMAIL`
- [ ] `S3_ENDPOINT` (not used)
- [ ] `S3_ACCESS_KEY_ID` (not used)
...
```

---

## First Deploy Checklist

- [ ] Read state file (determine FIRST_DEPLOY)
- [ ] Build successful
- [ ] Deploy successful
- [ ] D1 binding configured
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Health check pass
- [ ] Update state file

## Update Checklist

- [ ] Read state file (determine UPDATE)
- [ ] Build successful
- [ ] Deploy successful
- [ ] Health check pass
- [ ] Update state file (add to history)

---

## Commands Reference

```bash
# Deploy
npm run deploy

# Configure D1
npx wrangler pages bindings add d1 \
  --project-name=<name> \
  --binding=DB \
  --database=<db>

# Set secrets
npx wrangler pages secret put <VAR> --project-name=<name>

# Migrate
npm run db:migrate

# Verify
curl https://<url>/api/health
```

---

## Final Output

```
✅ DEPLOYMENT SELESAI

📋 Type: FIRST_DEPLOY / UPDATE
🌐 URL: https://my-app.pages.dev
📁 State: workflow/outputs/05-deployment/DEPLOYMENT_CONFIG.md

✅ Health Check: PASS
✅ Database: Connected
✅ SSL: Active

🎉 APLIKASI SUDAH LIVE!
```

---

## Deliverables

- [ ] Deployed application
- [ ] Updated DEPLOYMENT_CONFIG.md
- [ ] RELEASE_NOTES.md (if major update)
