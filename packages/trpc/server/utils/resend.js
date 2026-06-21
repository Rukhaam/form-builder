import { Resend } from 'resend';
import './loadEnv.js';


if (!process.env.RESEND_API_KEY) {
  console.error('FATAL: RESEND_API_KEY is missing.');
  console.error('I looked for RESEND_API_KEY in local and fallback env files.');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
