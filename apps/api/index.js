import './env.js';
import express from 'express';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import helmet from 'helmet';
import crypto from 'crypto';
import { db, subscriptions } from '@repo/database';
import { eq } from 'drizzle-orm';

import { appRouter, startCronJobs } from '@repo/trpc/server/index.js';
import { createContext } from '@repo/trpc/server/context.js';
import { getPlanByRazorpayPlanId } from '@repo/trpc/server/utils/plans.js';
import { oauthRouter } from './oauth.js';
import razorpayWebhookRouter from './webhooks/razorpay.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" } 
}));

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://form-builder-by-rukhaam.vercel.app',
];

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/+$/, '');
}

const configuredOrigins = [
  ...DEFAULT_ALLOWED_ORIGINS,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.CORS_ORIGINS,
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(','))
  .map(normalizeOrigin)
  .filter(Boolean);

const allowAllOrigins = configuredOrigins.includes('*');
const allowedOrigins = new Set(configuredOrigins.filter((origin) => origin !== '*'));

const corsOptions = {
  origin(origin, callback) {
    console.log(`[CORS Check] Incoming Origin: ${origin}`);
    
    const normalizedOrigin = normalizeOrigin(origin);
    if (!origin || allowAllOrigins || allowedOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    console.error(`[CORS Blocked] Origin not in allowed list: ${origin}`);
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use('/api/billing/webhook', razorpayWebhookRouter);
app.use(express.json());
app.use('/api/auth', oauthRouter);

const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use('/trpc', trpcMiddleware);
app.use('/api/trpc', trpcMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
  if (typeof startCronJobs === 'function') {
    startCronJobs();
  }
});