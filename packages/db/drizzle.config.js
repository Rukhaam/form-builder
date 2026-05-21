import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // This matches the docker-compose setup
    url: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/formbuilder',
  },
});