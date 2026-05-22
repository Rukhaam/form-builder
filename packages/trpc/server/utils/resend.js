import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const envPath = path.resolve(__dirname, '../../../../.env');


dotenv.config({ path: envPath });


if (!process.env.RESEND_API_KEY) {
  console.error(`🚨 FATAL: RESEND_API_KEY is missing!`);
  console.error(`🚨 I looked for the .env file exactly here: ${envPath}`);
}

export const resend = new Resend(process.env.RESEND_API_KEY);