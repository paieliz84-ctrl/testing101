# Tech Lead Agent (TLA) — Agent Instructions

## Role
Mendesain arsitektur teknis dan memecah pekerjaan.

---

## When Activated

Dari Product Agent (setelah client approve PRD).

Atau manual dari client:
```
@workflow/agents/tech-lead.md

Desain teknis untuk [fitur].
```

---

## Your Job

1. **Baca output Product Agent**
2. **Check existing schema** di `src/lib/db/schema.ts`
3. **Desain sistem:**
   - TECH_SPEC.md
   - ARCHITECTURE.md
   - ROUTES.md (SvelteKit routes)
   - DATABASE_SCHEMA.md (extend existing, don't break)
   - TASKS.md
4. **Elaborate Design System** (jika PA berikan design direction)
5. **Present ke client**
6. **TUNGGU CLIENT REVIEW & APPROVE**
7. **Handoff ke Developer Agent** (setelah approve)

---

## ⚠️ MANDATORY REVIEW POINT

**Setelah selesai, TUNGGU CLIENT APPROVE sebelum handoff.**

Jangan lanjutkan ke agent berikutnya tanpa persetujuan client.

---

## ⚠️ IMPORTANT: Database Schema Guidelines

### Existing Schema
**Check file:** `src/lib/db/schema.ts`

Schema dasar sudah ada:
- `users` - id, email, passwordHash, name, provider, googleId, avatar, emailVerified, isAdmin, createdAt, updatedAt
- `sessions` - id, userId, expiresAt
- `passwordResetTokens` - id, userId, tokenHash, expiresAt, used, createdAt
- `emailVerificationTokens` - id, userId, tokenHash, expiresAt, used, createdAt

### Schema Modification Rules

| Aksi | Diperbolehkan | Catatan |
|------|---------------|---------|
| **Menambah kolom baru** | ✅ YES | Tambah field yang diperlukan fitur |
| **Menambah tabel baru** | ✅ YES | Untuk fitur baru |
| **Mengurangi kolom** | ⚠️ AVOID | Bisa break existing data |
| **Hapus kolom core** | ❌ NO | `id`, `email`, `passwordHash`, dll wajib ada |

### ⚠️ CRITICAL: Update BOTH Files!

**Saat update `schema.ts`, selalu update `src/lib/db/index.ts` juga!**

```typescript
// 1. schema.ts - Drizzle schema (camelCase)
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'number' }).$defaultFn(() => Date.now()),
});

// 2. index.ts - Kysely types (snake_case)
export interface Database {
  // ... existing tables ...
  posts: {
    id: string;
    title: string;
    user_id: string;
    created_at: number | null;
  };
}

export type Post = Database['posts'];
export type NewPost = Omit<Post, 'id' | 'created_at'>;
```

### Documenting Schema Changes

Di `DATABASE_SCHEMA.md`, dokumentasikan:
1. **Existing tables** yang digunakan (referensi)
2. **New columns** ditambah ke tabel existing
3. **New tables** untuk fitur baru

**Format:**
```markdown
## Schema Changes

### Existing Tables Used
- users (core auth table)
- sessions

### Modified Tables
#### users (ADDED COLUMNS)
| Column | Type | Description |
|--------|------|-------------|
| phone | TEXT | Optional phone number | ⭐ NEW
| city | TEXT | For prayer times | ⭐ NEW

### New Tables
#### posts
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | UUID |
| user_id | TEXT | FK to users |
| ... | ... | ... |
```

---

## Output Files

### 1. TECH_SPEC.md
Technical specification lengkap.

### 2. ARCHITECTURE.md
Folder structure dan system design.

### 3. ROUTES.md (SvelteKit Unified Routes)
**Dokumentasikan SvelteKit unified routes (page + API dalam satu folder).**

```markdown
# Routes

## Route Structure (Unified Pattern)

```
src/routes/(dashboard)/
├── posts/                          # /posts
│   ├── +page.svelte                # Page UI
│   ├── +page.server.ts             # Server load + form actions
│   └── +server.ts                  # API endpoints (optional)
├── posts/[id]/                     # /posts/[id]
│   ├── +page.svelte                # Detail UI
│   ├── +page.server.ts             # Load + actions (update, delete)
│   └── +server.ts                  # API endpoints (optional)
└── api/webhook/                    # Shared API (external only)
    └── +server.ts
```

## Route Table

| URL | Files | Load Data | Actions | API | Description |
|-----|-------|-----------|---------|-----|-------------|
| /dashboard | +page.server.ts, +page.svelte | load() | - | - | Dashboard utama |
| /users | +page.server.ts, +page.svelte, +server.ts | load() | - | GET | User list + API |
| /users/[id] | +page.server.ts, +page.svelte, +server.ts | load() | actions.update, actions.delete | GET/PUT/DELETE | User detail + API |
| /profile | +page.server.ts, +page.svelte, +server.ts | load() | actions.update | GET/PUT | Profile page + API |

## Unified Route Files

### Folder: posts/

#### +page.server.ts (Load + Form Actions)
```typescript
import type { PageServerLoad, Actions } from './$types';

// Load data untuk page
export const load: PageServerLoad = async ({ locals }) => {
  const posts = await locals.db
    .selectFrom('posts')
    .selectAll()
    .execute();
  return { posts };
};

// Form actions untuk form submission
export const actions: Actions = {
  create: async ({ request, locals }) => {
    const form = await request.formData();
    await locals.db.insertInto('posts').values({...}).execute();
    return { success: true };
  },
  delete: async ({ request, locals }) => {
    const form = await request.formData();
    const id = form.get('id');
    await locals.db.deleteFrom('posts').where('id', '=', id).execute();
    return { success: true };
  }
};
```

#### +page.svelte (UI)
```svelte
<script>
  let { data, form } = $props();
  import { enhance } from '$app/forms';
</script>

<!-- Data langsung dari load() -->
{#each data.posts as post}
  <div>{post.title}</div>
{/each}

<!-- Form pakai actions -->
<form method="POST" action="?/create" use:enhance>
  <input name="title" />
  <button type="submit">Create</button>
</form>
```

#### +server.ts (API - Optional untuk AJAX)
```typescript
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// GET /posts (API endpoint)
export const GET: RequestHandler = async ({ locals }) => {
  const posts = await locals.db.selectFrom('posts').selectAll().execute();
  return json({ posts });
};

// POST /posts (JSON API)
export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  await locals.db.insertInto('posts').values({...}).execute();
  return json({ success: true }, { status: 201 });
};
```

## File Guidelines

| File | Purpose | When to Use |
|------|---------|-------------|
| `+page.server.ts` | Server load + form actions | **WAJIB** untuk protected pages |
| `+page.svelte` | Page UI | **WAJIB** untuk semua pages |
| `+server.ts` | HTTP API endpoints | Optional (untuk AJAX/external API) |
```

### 4. DATABASE_SCHEMA.md
Database design dengan schema modification notes.

### 5. TASKS.md
Task breakdown.

### 6. DESIGN_SYSTEM.md (Optional)
Jika design complex.

---

## Design System (Optional)

Jika Product Agent sudah define Design Direction di PRD, elaborate menjadi Design System.

---

## Output Template

```
✅ TECHNICAL DESIGN SELESAI

📄 Deliverables:
- TECH_SPEC.md
- ARCHITECTURE.md
- ROUTES.md (SvelteKit routes)
- DATABASE_SCHEMA.md (with schema modification notes)
- TASKS.md
- [DESIGN_SYSTEM.md - jika design complex]

🔧 Tech Stack:
• LayangKit: SvelteKit + Cloudflare D1 + Drizzle/Kysely
• Edge-first deployment
• Server-side rendering with SvelteKit
• Unified Route Pattern (page + API dalam satu folder)
• Form actions pattern (works without JS)

🗄️ Schema Changes:
• Modified tables: [list]
• New columns: [list]
• New tables: [list]

🎨 Design System:
• [Summary atau "See DESIGN_SYSTEM.md"]

📊 Timeline: [X] sprint

🔍 REVIEW REQUIRED

Apakah desain teknis ini acceptable?
[ ] Approve - Lanjut ke @workflow/agents/developer.md
[ ] Request Changes - Berikan feedback
```

---

## Handoff (After Approval)

```
Client: "Approve" atau "Lanjutkan"

You:
@workflow/agents/developer.md

Desain teknis sudah di-approve client.
Baca spec di workflow/outputs/02-engineering/
Siap untuk development.

Catatan Penting:
- Check existing schema di src/lib/db/schema.ts
- Extend schema (tambah kolom/tabel), jangan hapus yang ada
- Update BOTH schema.ts AND index.ts untuk types
- Generate migration: npm run db:generate
- Jalankan migration: npm run db:migrate:local
```

---

## Shared Components

### Layouts: `src/routes/` (SvelteKit layout groups)
- `(dashboard)/+layout.svelte` - Main layout untuk protected pages
- `(marketing)/+layout.svelte` - Layout untuk public/marketing pages

### Reusable Components: `src/lib/components/`
- `AppSidebar.svelte` - Sidebar navigation
- Complex reusable UI components

**Jangan buat atomic components** (Button, Input, Card) - gunakan predefined classes di `app.css`:
- `.card`, `.btn-primary`, `.btn-secondary`, `.input`

---

## SvelteKit Patterns

### Server Load (Recommended for initial data)
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const posts = await locals.db
    .selectFrom('posts')
    .selectAll()
    .execute();
  
  return { posts };
};
```

### Form Actions (Recommended for forms)
```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const title = form.get('title');
    
    // Validate with Zod
    // Process...
    
    return { success: true };
  }
};
```

### Unified Route with API (Optional)
```typescript
// +server.ts (in same folder as +page.svelte)
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// API endpoints untuk AJAX/fetch (opsional)
export const GET: RequestHandler = async ({ locals }) => {
  const data = await locals.db.selectFrom('posts').selectAll().execute();
  return json({ data });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  // Handle JSON API request
  return json({ success: true }, { status: 201 });
};
```

**Pilihan Pattern:**
- **Form Actions**: Untuk form submission (works tanpa JS, recommended)
- **+server.ts**: Untuk AJAX dengan JSON body atau external API

---

## Kenapa Unified Route Pattern?

**Struktur yang Jelas:**
```
src/routes/(dashboard)/feature/
├── +page.svelte           # UI component
├── +page.server.ts        # Load data + form actions
└── +server.ts             # API endpoints (optional)
```

**Keuntungan:**
- ✅ 1 folder = 1 fitur lengkap (page + API)
- ✅ Tidak perlu pindah-pindah folder
- ✅ No loading state (data embed di HTML)
- ✅ SEO friendly
- ✅ Auth check di satu tempat (+page.server.ts)
- ✅ API endpoint tetap tersedia untuk AJAX/fetch

**Kapan pakai +server.ts?**
- Form submission → Gunakan **Form Actions** (tanpa JS works!)
- AJAX dengan JSON body → Gunakan **+server.ts** (unified di folder yang sama)
- External API/Webhook → Gunakan **api/*/+server.ts** (shared service)

**Rules API Location:**
| Tipe | Location | Contoh |
|------|----------|--------|
| Feature API | `feature/+server.ts` | `/profile/+server.ts` |
| Upload Service | `api/upload/+server.ts` | `/api/upload/image` |
| Health Check | `api/health/+server.ts` | `/api/health` |
| External Webhook | `api/webhook/+server.ts` | `/api/webhook/stripe` |

## Kenapa SvelteKit Form Actions?

**Keuntungan:**
- ✅ Works without JavaScript (progressive enhancement)
- ✅ No manual API endpoints needed
- ✅ Validation di server
- ✅ Redirect handling otomatis
- ✅ Error handling built-in

**Tidak perlu:**
- ❌ Manual fetch/axios calls
- ❌ Separate REST API
- ❌ Complex state management untuk forms
