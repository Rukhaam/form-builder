import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

const envFiles = [
  path.resolve(__dirname, '.env.local'),
  path.resolve(rootDir, '.env.local'),
  path.resolve(__dirname, '.env'),
  path.resolve(rootDir, '.env'),
];

for (const envFile of envFiles) {
  dotenv.config({ path: envFile });
}
