#!/usr/bin/env node
/**
 * Seed script untuk populate database dengan data awal.
 * 
 * Usage:
 *   npm run db:seed         # Seed ke production database
 *   npm run db:seed:local   # Seed ke local database
 * 
 * Note: Script ini menggunakan wrangler CLI untuk execute SQL.
 * Pastikan sudah login: npx wrangler login
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const isLocal = args.includes('--local');

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateSQL(): string {
  const user1Id = generateUUID();
  const user2Id = generateUUID();
  const user3Id = generateUUID();
  
  const now = Date.now();
  
  return `
-- Insert sample users
INSERT OR IGNORE INTO users (id, email, name, provider, email_verified, created_at, updated_at) VALUES 
  ('${user1Id}', 'john@example.com', 'John Doe', 'email', 1, ${now}, ${now}),
  ('${user2Id}', 'jane@example.com', 'Jane Smith', 'google', 1, ${now}, ${now}),
  ('${user3Id}', 'bob@example.com', 'Bob Wilson', 'email', 0, ${now}, ${now});
`;
}

async function seed() {
  console.log('🌱 Seeding database...\n');
  
  try {
    // Generate SQL
    const sql = generateSQL();
    
    // Write to temp file
    const fs = await import('fs');
    const path = await import('path');
    const tempFile = path.join(process.cwd(), '.temp-seed.sql');
    fs.writeFileSync(tempFile, sql);
    
    // Execute via wrangler
    const localFlag = isLocal ? '--local' : '--remote';
    console.log(`Executing ${isLocal ? 'local' : 'production'} database...\n`);
    
    execSync(`npx wrangler d1 execute DB ${localFlag} --file=${tempFile}`, {
      stdio: 'inherit',
    });
    
    // Cleanup
    fs.unlinkSync(tempFile);
    
    console.log('\n🎉 Seeding complete!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
