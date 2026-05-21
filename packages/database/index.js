import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';

// The URL matches your docker-compose.yml configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:rukhaam2006@localhost:5432/formbuilder'
});

export const db = drizzle(pool, { schema });
export * from './schema.js';