import path from 'node:path'
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ path: path.resolve(__dirname, '..', '.env.local') })

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
