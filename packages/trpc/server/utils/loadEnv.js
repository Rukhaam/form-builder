import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(__dirname, '../..');
const rootDir = path.resolve(packageDir, '../..');

const envFiles = [
  path.resolve(packageDir, '.env.local'),
  path.resolve(rootDir, '.env.local'),
  path.resolve(packageDir, '.env'),
  path.resolve(rootDir, '.env'),
];

for (const envFile of envFiles) {
  dotenv.config({ path: envFile });
}
