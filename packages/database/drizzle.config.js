import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  ssl: false,
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5434,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'rukhaam2006',
    database: process.env.DB_NAME || 'formbuilder',
    url: process.env.DATABASE_URL || 'postgres://postgres:rukhaam2006@localhost:5434/formbuilder',
  },
});