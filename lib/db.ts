import { createClient } from '@libsql/client';

const rawUrl = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Fallback to local SQLite if cloud URL is provided without a token or if no URL is provided
const isCloudWithoutToken = rawUrl?.startsWith('libsql://') && !authToken;
const useLocal = !rawUrl || isCloudWithoutToken;

if (isCloudWithoutToken) {
  console.warn('⚠️ TURSO_URL provided but TURSO_AUTH_TOKEN is missing. Falling back to local SQLite (local.db).');
} else if (!rawUrl) {
  console.info('ℹ️ No TURSO_URL provided. Using local SQLite (local.db).');
}

export const db = createClient({
  url: useLocal ? 'file:local.db' : rawUrl!,
  authToken: authToken,
});

export async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        icon_url TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    // If cloud failed, we don't force fallback here because client is already created
  }
}
