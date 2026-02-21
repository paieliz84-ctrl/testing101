# LayangKit - Agent Documentation

> **Edge-first full-stack starter template** — SvelteKit + Cloudflare D1 + Drizzle ORM with authentication, email verification, and file uploads.

This document provides comprehensive information for AI coding agents working on the LayangKit project.

---

## Project Overview

LayangKit (also known as `layang-app`) is a modern full-stack web application starter template built with:

- **Framework**: [SvelteKit 2.x](https://kit.svelte.dev/) + [Svelte 5.x (Runes)](https://svelte.dev/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite-based edge database)
- **ORM**: [Drizzle ORM 0.40](https://orm.drizzle.team/) with [Kysely](https://kysely.dev/) query builder
- **Authentication**: Custom session-based auth using [Arctic](https://arcticjs.dev/) for OAuth
- **Password Hashing**: Web Crypto API (PBKDF2) - Cloudflare Workers compatible
- **Email**: [Resend](https://resend.com/) for transactional emails
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) for file uploads
- **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com/) with custom dark/light themes
- **Icons**: [Lucide](https://lucide.dev/)
- **Build Tool**: [Vite 6.x](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/) for unit tests, [Playwright](https://playwright.dev/) for E2E tests

---

## Project Structure

```
.
├── src/
│   ├── lib/                    # Shared libraries and utilities
│   │   ├── auth/               # Authentication logic
│   │   │   ├── google.ts       # Google OAuth integration (Arctic)
│   │   │   ├── password.ts     # PBKDF2 password hashing (Web Crypto API)
│   │   │   └── session.ts      # Session management (create, validate, invalidate)
│   │   ├── db/                 # Database layer (2 files only)
│   │   │   ├── index.ts        # All types + exports (Kysely + Application)
│   │   │   └── schema.ts       # Drizzle ORM schema (camelCase)
│   │   ├── email/              # Email service
│   │   │   ├── resend.ts       # Resend email client
│   │   │   └── templates/      # Email templates
│   │   │       └── verification.ts
│   │   ├── image/              # Image processing utilities
│   │   │   └── convert.ts      # WebP conversion (Canvas API)
│   │   ├── storage/            # S3-compatible storage (R2, Wasabi, S3, etc.)
│   │   │   └── r2.ts           # R2 client, presigned URLs, file operations
│   │   └── stores/             # Svelte 5 runes-based stores
│   │       └── theme.svelte.ts # Theme store (dark/light mode)
│   ├── routes/                 # SvelteKit routes (file-based routing)
│   │   ├── (dashboard)/        # Route group: protected dashboard pages
│   │   │   ├── dashboard/      # Main dashboard (unified route)
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── +server.ts  # API endpoint (optional)
│   │   │   ├── posts/          # Posts feature (unified route)
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   ├── +server.ts  # API for /posts
│   │   │   │   └── [id]/       # /posts/[id]
│   │   │   │       ├── +page.svelte
│   │   │   │       ├── +page.server.ts
│   │   │   │       └── +server.ts  # API for /posts/[id]
│   │   │   ├── settings/       # Settings page
│   │   │   ├── users/          # Users list (unified route)
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.server.ts
│   │   │   │   └── +server.ts
│   │   │   └── profile/        # User profile (unified route)
│   │   │       ├── +page.svelte
│   │   │       ├── +page.server.ts
│   │   │       └── +server.ts 
│   │   ├── api/                # Shared API endpoints only (external services)
│   │   │   ├── health/         # Health check endpoint (monitoring)
│   │   │   ├── upload/         # File upload service (shared)
│   │   │   │   ├── image/      # Image upload with WebP conversion
│   │   │   │   └── presign/    # Presigned URL for direct R2 upload
│   │   │   └── webhook/        # External webhooks (Stripe, etc.)
│   │   ├── auth/               # Auth pages (public)
│   │   │   ├── forgot-password/
│   │   │   ├── google/         # OAuth init & callback
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   ├── resend-verification/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── +layout.svelte      # Root layout
│   │   ├── +page.svelte        # Home/Landing page
│   │   └── ...
│   ├── app.css                 # Global styles & Tailwind 4 theme
│   ├── app.d.ts                # TypeScript declarations
│   ├── app.html                # HTML template
│   └── hooks.server.ts         # Server hooks (DB + Auth injection)
├── migrations/                 # Drizzle database migrations
├── tests/
│   ├── e2e/                    # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   └── navigation.spec.ts
│   └── unit/                   # Vitest unit tests
│       ├── lib/
│       │   └── auth/
│       │       ├── password.test.ts
│       │       └── session.test.ts
│       ├── mocks/
│       │   └── app.ts          # Mock for $app modules
│       └── setup.ts            # Test setup (crypto mock, cleanup)
├── docs/                       # Documentation
├── scripts/                    # Utility scripts (seeding)
├── static/                     # Static assets
├── drizzle.config.ts           # Drizzle Kit configuration
├── svelte.config.js            # SvelteKit configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright E2E configuration
├── wrangler.toml               # Cloudflare Wrangler configuration
└── package.json
```

---

## Key Configuration Files

### `wrangler.toml`
Cloudflare Workers configuration with **bindings** for D1 database and R2 storage (optional):

```toml
name = "layang-app"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"                              # Access via: env.DB
database_name = "layang-app"                # Database name in Cloudflare
database_id = "your-database-id"            # ⚠️ MUST be updated after creation
migrations_dir = "migrations"

[[r2_buckets]]
binding = "STORAGE"                         # Access via: env.STORAGE
bucket_name = "layang-app-storage"
```

**Important:** `wrangler.toml` contains **bindings** (resource references), not secrets. For external API credentials (Google OAuth, Resend, S3 API keys), use `.env` file instead.

### `drizzle.config.ts`
Drizzle Kit configuration for migrations:
- Schema: `./src/lib/db/schema.ts`
- Output: `./migrations`
- Dialect: `sqlite`
- Driver: `d1-http`

### `svelte.config.js`
SvelteKit with Cloudflare adapter:
```javascript
import adapter from '@sveltejs/adapter-cloudflare';
```

### `vite.config.ts`
Standard Vite config with SvelteKit plugin and source maps enabled.

---

## Build and Development Commands

```bash
# Development
npm run dev                   # Start Vite dev server (localhost:5173)
npm run check                 # Type-check with svelte-check

# Building
npm run build                 # Build for production
npm run preview               # Preview production build locally with Wrangler

# Testing
npm run test                  # Run unit tests (Vitest)
npm run test:watch            # Run unit tests in watch mode
npm run test:coverage         # Run tests with coverage
npm run test:e2e              # Run E2E tests (Playwright)
npm run test:e2e:ui           # Run E2E tests with UI

# Database
npm run db:generate           # Generate migrations from schema.ts
npm run db:migrate:local      # Apply migrations to local D1
npm run db:migrate            # Apply migrations to production D1
npm run db:refresh:local      # Reset local DB + reapply migrations
npm run db:seed               # Seed database via HTTP API
npm run db:seed:local         # Execute seed.sql locally
npm run db:studio             # Open Drizzle Studio GUI

# Cloudflare
npm run cf:typegen            # Generate Cloudflare Workers types
npm run deploy                # Deploy to Cloudflare Pages
npm run logs                  # View production logs (real-time)
```

---

## Database Architecture

### Dual ORM Approach

The project uses a **dual ORM strategy**:

1. **Drizzle ORM**: Used ONLY for schema definition and migrations (`schema.ts`)
2. **Kysely**: Used for actual database queries at runtime (types in `index.ts`)

**⚠️ IMPORTANT RULE:**
- ✅ **Schema & Migrations** → Use Drizzle (`schema.ts`, `relations`)
- ✅ **All Runtime Queries** → Use Kysely (`locals.db.selectFrom()`, `insertInto()`, etc.)
- ❌ **NEVER use** `locals.db.query.table.findMany()` (Drizzle query syntax)
- ❌ **NEVER use** `locals.db.insert(table).values()` (Drizzle insert syntax)

**Rationale**: Kysely has better Cloudflare D1 support via `kysely-d1` dialect and provides excellent type-safe query building with cleaner SQL-like syntax.

### Database Files (Simplified)

```
src/lib/db/
├── schema.ts    # Drizzle schema only (for migrations)
└── index.ts     # All types: Database interface, Table types, Insert types
```

**⚠️ IMPORTANT**: When modifying `schema.ts`, always update the `Database` interface in `index.ts` to keep them in sync!

### Schema Mapping (⚠️ CRITICAL)

**IMPORTANT**: When updating `schema.ts`, you MUST also update `index.ts` to keep types in sync!

When converting from Drizzle (`schema.ts`) to Kysely (`index.ts` `Database` interface):
- `camelCase` → `snake_case` (e.g., `passwordHash` → `password_hash`)
- `integer(..., { mode: 'boolean' })` → `number` (SQLite uses 0/1)
- `$defaultFn(...)` fields → nullable (e.g., `created_at: number | null`)
- `.notNull()` without default → required type (e.g., `email: string`)

### Query Pattern Examples

**✅ CORRECT (Kysely):**
```typescript
// Select
const users = await locals.db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', email)
  .execute();

// Insert
await locals.db
  .insertInto('users')
  .values({ id, email, password_hash: hash })
  .execute();

// Update
await locals.db
  .updateTable('users')
  .set({ last_login: Date.now() })
  .where('id', '=', userId)
  .execute();

// Delete
await locals.db
  .deleteFrom('sessions')
  .where('id', '=', sessionId)
  .execute();
```

**❌ WRONG (Drizzle ORM query syntax - jangan dipakai):**
```typescript
// Jangan pakai ini untuk runtime queries!
await locals.db.query.users.findMany({ where: eq(users.id, id) });
await locals.db.insert(users).values({ email });
await locals.db.update(users).set({ name }).where(eq(users.id, id));
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with auth fields |
| `sessions` | Session-based authentication |
| `password_reset_tokens` | Password reset flow |
| `email_verification_tokens` | Email verification flow |

---

## Authentication System

### Session-Based Auth

The project implements custom session-based authentication (not JWT):

1. **Session Creation**: On login, a session ID is generated and stored in `sessions` table
2. **Cookie Storage**: Session ID stored in HTTP-only, secure cookie (`auth_session`)
3. **Session Validation**: Performed in `hooks.server.ts` on every request
4. **Auto-refresh**: Sessions refresh if expiring within 15 days (30-day total lifespan)

### Auth Flows

1. **Email/Password**: Register → (Optional: Email Verify) → Login → Session
2. **Google OAuth**: `/auth/google` → Google consent → `/auth/google/callback` → Session
3. **Password Reset**: Forgot → Token email → Reset page → Update password
4. **Email Verification**: Resend → Verification email → Click link → Verify

### Key Auth Files

- `src/lib/auth/session.ts` - Core session logic
- `src/lib/auth/password.ts` - PBKDF2 password hashing
- `src/lib/auth/google.ts` - Google OAuth (Arctic library)
- `src/hooks.server.ts` - Session validation on every request

---

## Configuration

### File Structure

| File | Purpose | Contains |
|------|---------|----------|
| `wrangler.toml` | Cloudflare Workers bindings | D1 database_id, R2 bucket bindings |
| `.env` | External API secrets | Google OAuth, Resend, S3 API credentials |

### wrangler.toml (Bindings - REQUIRED)

Database and storage bindings for the application:

```toml
[[d1_databases]]
binding = "DB"
database_id = "your-database-id"  # Must match created database

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "your-bucket"
```

### .env (Secrets - Optional)

External service credentials for additional features:

```env
# Google OAuth (for Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Resend Email (for verification & password reset)
RESEND_API_TOKEN=re_your_token
FROM_EMAIL=noreply@yourdomain.com
REPLY_TO_EMAIL=support@yourdomain.com

# S3 Storage (via S3-compatible API - R2, Wasabi, AWS S3, etc.)
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET_NAME=my-bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_PUBLIC_URL=https://cdn.example.com
```

> **Note:** For Drizzle Studio, add `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_API_TOKEN` to `.env` separately.

**Production**: Configure in Cloudflare Dashboard → Pages → Settings → Environment Variables.

---

## Code Style Guidelines

### TypeScript Conventions

1. **Strict TypeScript**: `strict: true` enabled in tsconfig.json
2. **Type imports**: Use `import type { ... }` for type-only imports
3. **Function exports**: Prefer named exports over default exports
4. **Error handling**: Always handle errors with try/catch in async functions

### Svelte 5 Runes

The project uses Svelte 5 with runes:

```svelte
<script>
  // Props
  let { data, children } = $props();
  
  // Reactive state
  let count = $state(0);
  
  // Derived values
  let doubled = $derived(count * 2);
  
  // Effects
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### Styling Conventions

1. **Tailwind CSS 4**: Uses `@theme` directive in `app.css`
2. **CSS Variables**: Theme colors defined as CSS variables
3. **Component classes**: Predefined in `app.css` (`.card`, `.btn-primary`, `.input`, etc.)
4. **Dark/Light mode**: Toggle via `html.light` / `html.dark` classes

---

## Testing Strategy

### Unit Tests (Vitest)

- **Location**: `tests/unit/`
- **Config**: `vitest.config.ts`
- **Environment**: `jsdom`
- **Setup**: `tests/unit/setup.ts` (mocks crypto, matchMedia)

Run with:
```bash
npm run test          # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### E2E Tests (Playwright)

- **Location**: `tests/e2e/`
- **Config**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:5173` (configurable via `PLAYWRIGHT_BASE_URL`)

Run with:
```bash
npm run test:e2e      # Run all tests
npm run test:e2e:ui   # Interactive UI mode
npm run test:e2e:debug # Debug mode
```

---

## Data Flow Patterns

### Pattern 1: Server Load (Recommended)

Use for initial page data - data is embedded in HTML, no loading states needed.

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const users = await locals.db
    .selectFrom('users')
    .selectAll()
    .execute();
  
  return { users };
};
```

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props(); // Data already available
</script>

{#each data.users as user}
  <UserCard {user} />
{/each}
```

### Pattern 2: Form Actions (Recommended)

Use for form submissions - works without JavaScript.

```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const email = form.get('email');
    
    // Validate with Zod
    // Process...
    
    return { success: true };
  }
};
```

```svelte
<!-- +page.svelte -->
<form method="POST">
  <input name="email" type="email" required />
  <button type="submit">Submit</button>
</form>
```

### Pattern 3: API Endpoints (Unified Route)

Use for client-side data fetching or external API access. Can be placed **in the same folder as the page** (unified) or in `api/` folder (shared).

**Unified Route (Recommended)** - Page + API in one folder:
```
src/routes/(dashboard)/posts/
├── +page.svelte           # Page UI
├── +page.server.ts        # Server load + form actions
└── +server.ts             # API endpoints (GET/POST/PUT/DELETE)
```

```typescript
// +server.ts (same folder as +page.svelte)
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// GET /posts (API version)
export const GET: RequestHandler = async ({ locals }) => {
  const data = await locals.db.selectFrom('posts').selectAll().execute();
  return json({ data });
};

// POST /posts (for AJAX requests)
export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  // ... handle API request
  return json({ success: true }, { status: 201 });
};
```

**Shared API** - Only for external/shared endpoints:
```
src/routes/api/webhook/+server.ts    # External webhooks
src/routes/api/health/+server.ts     # Health checks
```

---

## Security Considerations

1. **Password Hashing**: PBKDF2 with 100,000 iterations, SHA-256
2. **Session Cookies**: HTTP-only, Secure (in production), SameSite=Lax
3. **CSRF Protection**: State parameter in OAuth flow
4. **Input Validation**: Zod 4.x validation on all inputs
5. **SQL Injection**: Protected via Kysely parameterized queries
6. **XSS**: Svelte's automatic escaping

---

## Deployment

### Prerequisites

1. Cloudflare account
2. Wrangler CLI authenticated: `npx wrangler login`
3. D1 database created: `npx wrangler d1 create my-database`
4. R2 bucket created (optional, for file uploads)

### Deploy Steps

```bash
# 1. Build
npm run build

# 2. Deploy to Cloudflare Pages
npm run deploy
```

### Post-Deployment

1. Set environment variables in Cloudflare Dashboard
2. Bind D1 database and R2 bucket in Settings > Bindings
3. Apply database migrations: `npm run db:migrate`

---

## Common Tasks

### Adding a New Database Table

⚠️ **ALWAYS update both files when modifying schema!**

1. Add table to `src/lib/db/schema.ts` (Drizzle - for migrations only):
```typescript
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  userId: text('user_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'number' }).$defaultFn(() => Date.now()),
});
```

2. **Add corresponding types to `src/lib/db/index.ts`**:
```typescript
// Add to Database interface
export interface Database {
  // ... existing tables ...
  
  posts: {
    id: string;
    title: string;
    content: string | null;
    user_id: string;
    created_at: number | null;
  };
}

// Add table type export
export type Post = Database['posts'];
export type NewPost = Omit<Post, 'id' | 'created_at'>;
```

3. Generate migration: `npm run db:generate`

4. Apply migration: `npm run db:migrate:local`

5. **Use Kysely for all runtime queries**:
```typescript
// In your +page.server.ts or +server.ts
const posts = await locals.db
  .selectFrom('posts')
  .selectAll()
  .where('user_id', '=', locals.user.id)
  .execute();
```

### Adding a New Protected Route

1. Create route folder: `src/routes/(dashboard)/my-feature/+page.svelte`
2. Add unified server files:

```
src/routes/(dashboard)/my-feature/
├── +page.svelte              # Page UI
├── +page.server.ts           # Server load + form actions
└── +server.ts                # API endpoints (optional)
```

```typescript
// +page.server.ts
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

// Auth check + data loading
export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');
  
  const data = await locals.db
    .selectFrom('my_table')
    .selectAll()
    .execute();
    
  return { data };
};

// Form actions (works without JavaScript)
export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Unauthorized' });
    
    const form = await request.formData();
    // Process form...
    return { success: true };
  }
};
```

```typescript
// +server.ts (optional - for AJAX/fetch API)
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  
  const data = await locals.db.selectFrom('my_table').selectAll().execute();
  return json({ data });
};
```

### Adding a New API Endpoint

1. Create endpoint: `src/routes/api/my-endpoint/+server.ts`
2. Implement handlers:
```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  // Access DB via locals.db
  const data = await locals.db.selectFrom('users').selectAll().execute();
  return json({ data });
};
```

---

## Troubleshooting

### "D1 binding not found"
- Check `wrangler.toml` has correct `database_id` (not the database name)
- Ensure database exists: `npx wrangler d1 list`
- For production, check bindings in Cloudflare Dashboard → Pages → Settings → Bindings
- For local dev, run: `npm run db:migrate:local` first

### "Email not sending"
- Check `RESEND_API_TOKEN` and `FROM_EMAIL` in `.env` (local) or Dashboard (production)
- Verify domain is verified in Resend dashboard
- Check spam folders

### "Upload failed"
- Verify R2 credentials and bucket name
- Check R2 bucket exists and is accessible
- Verify `R2_PUBLIC_URL` is correct

### Type errors after schema change
- Run `npm run check` to identify issues
- **Ensure `src/lib/db/index.ts` Database interface is updated to match `schema.ts`**
- Run `npm run cf:typegen` to update Cloudflare types

---

## References

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Kysely](https://kysely.dev/)
- [Arctic OAuth](https://arcticjs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
