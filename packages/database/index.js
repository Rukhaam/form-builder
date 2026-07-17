import './env.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';

function createPoolConfig(connectionString) {
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL.');
  }

  const config = { connectionString };

  try {
    const databaseUrl = new URL(connectionString);
    const isRailwayTcpProxy = databaseUrl.hostname.endsWith('.proxy.rlwy.net');

    if (isRailwayTcpProxy) {
      // Railway's public Postgres proxy presents a self-signed certificate.
      // Remove libpq's sslmode parameter so pg uses this explicit TLS config.
      databaseUrl.searchParams.delete('sslmode');
      config.connectionString = databaseUrl.toString();
      config.ssl = {
        rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
      };
    }
  } catch {
    // Let pg surface a useful connection-string error for malformed URLs.
  }

  return config;
}

const pool = new Pool({
  ...createPoolConfig(process.env.DATABASE_URL),
});

export const db = drizzle(pool, { schema });
export * from './schema.js';
