// drizzle-kit config — generate versioned SQL migrations (./drizzle) from ./src/db/schema.ts
// and run them against the DATABASE_URL branch. Migrations are committed and applied locally;
// CI never holds DB credentials.

import { defineConfig } from 'drizzle-kit'
import { databaseUrl } from './scripts/env'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: databaseUrl() },
})
