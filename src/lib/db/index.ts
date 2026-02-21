// ============================================================================
// Database Exports
// ============================================================================
// Note: Kysely instance is created in hooks.server.ts
// Schema is kept for Drizzle Kit migrations only

export * as schema from './schema';

// ============================================================================
// Kysely Database Types (from Drizzle Schema)
// ============================================================================
// CONVERSION RULES:
// - Drizzle camelCase → Kysely snake_case (e.g., passwordHash → password_hash)
// - Drizzle integer(..., { mode: 'boolean' }) → Kysely number | null (SQLite uses 0/1)
// - Drizzle $defaultFn(...) fields → Kysely nullable (number | null, string | null)
// - Drizzle .notNull() without default → Kysely required type

export interface Database {
  users: {
    id: string;
    email: string;
    name: string;
    bio: string | null;
    location: string | null;
    website: string | null;
    password_hash: string | null;
    provider: 'email' | 'google';
    google_id: string | null;
    avatar: string | null;
    email_verified: number | null; // SQLite boolean = 0/1
    is_admin: number | null; // SQLite boolean = 0/1
    created_at: number | null;
    updated_at: number | null;
  };

  sessions: {
    id: string;
    user_id: string;
    expires_at: number;
  };

  password_reset_tokens: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: number;
    used: number; // SQLite boolean = 0/1
    created_at: number;
  };

  email_verification_tokens: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: number;
    used: number; // SQLite boolean = 0/1
    created_at: number;
  };
}

/** Alias for Database interface */
export type DB = Database;

// ============================================================================
// Table Types
// ============================================================================

export type User = Database['users'];
export type Session = Database['sessions'];
export type PasswordResetToken = Database['password_reset_tokens'];
export type EmailVerificationToken = Database['email_verification_tokens'];

// ============================================================================
// Insert Types (omit auto-generated fields)
// ============================================================================

export type NewUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type NewSession = Session;
export type NewPasswordResetToken = PasswordResetToken;
export type NewEmailVerificationToken = EmailVerificationToken;

// ============================================================================
// Auth Types
// ============================================================================

export type AuthProvider = 'email' | 'google';

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// ============================================================================
// API/Form Input Types
// ============================================================================

export interface ProfileUpdateInput {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
}

// ============================================================================
// Legacy Aliases (backward compatibility)
// ============================================================================

/** @deprecated Use `Session` instead */
export type DbSession = Session;
