import type { Config } from 'drizzle-kit';

// Drizzle Studio membutuhkan Cloudflare API Token untuk akses D1 via HTTP API.
// Ini hanya untuk development tools, bukan untuk aplikasi berjalan.
// 
// Untuk setup, tambahkan ke .env:
//   CLOUDFLARE_ACCOUNT_ID=your_account_id
//   CLOUDFLARE_DATABASE_ID=your_database_id
//   CLOUDFLARE_API_TOKEN=your_api_token
//
// Get token: https://dash.cloudflare.com/profile/api-tokens
// Permission: Account: D1:Edit
//
// Alternatif: Gunakan wrangler commands untuk query database:
//   npx wrangler d1 execute DB --local --command="SELECT * FROM users"

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !databaseId || !token) {
  console.error('\n❌ Drizzle Studio membutuhkan Cloudflare API credentials.');
  console.error('\nTambahkan ke .env:');
  console.error('  CLOUDFLARE_ACCOUNT_ID=your_account_id');
  console.error('  CLOUDFLARE_DATABASE_ID=your_database_id');
  console.error('  CLOUDFLARE_API_TOKEN=your_api_token');
  console.error('\nAtau gunakan wrangler command:');
  console.error('  npx wrangler d1 execute DB --local --command="SELECT * FROM users"\n');
  
  // Throw error untuk menghentikan process dengan jelas
  throw new Error('Cloudflare API credentials not found in environment');
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId,
    databaseId,
    token,
  },
} satisfies Config;
