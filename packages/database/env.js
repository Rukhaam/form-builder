import * as dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "../..");

const envFiles = [
  resolve(__dirname, ".env.local"),
  resolve(rootDir, ".env.local"),
  resolve(__dirname, ".env"),
  resolve(rootDir, ".env"),
];

for (const envFile of envFiles) {
  dotenv.config({ path: envFile });
}
