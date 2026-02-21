import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table with auth support
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID for session-based auth
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'), // User bio/description
  location: text('location'), // User location
  website: text('website'), // User website
  // Auth fields
  passwordHash: text('password_hash'), // null for OAuth users
  provider: text('provider', { enum: ['email', 'google'] }).notNull().default('email'),
  googleId: text('google_id').unique(), // for Google OAuth
  avatar: text('avatar'), // profile picture URL
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  // Timestamps
  createdAt: integer('created_at', { mode: 'number' }).$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at', { mode: 'number' }).$defaultFn(() => Date.now())
});

// Sessions table for session-based auth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'number' }).notNull()
});

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'number' }).$defaultFn(() => Date.now())
});

// Email verification tokens
export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'number' }).$defaultFn(() => Date.now())
});




export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}));

export const emailVerificationTokensRelations = relations(emailVerificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [emailVerificationTokens.userId],
    references: [users.id]
  })
}));

