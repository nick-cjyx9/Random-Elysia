/* eslint-disable node/prefer-global/process */
import 'dotenv/config'
import { type Config, defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './backend/src/db/schema.ts',
  out: './backend/src/db/migration',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: process.env.ACCOUNT_ID,
    databaseId: process.env.DB_ID,
    token: process.env.CF_TOKEN,
  },
  driver: 'd1-http',
  verbose: true,
  strict: true,
} as Config)
