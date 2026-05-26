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
import { oauthRouter } from './oauth.js'; 


const app = express();
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'], 
  credentials: true,
}));

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    return res.status(400).json({ ok: false, error: 'Missing webhook secret/signature' });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(401).json({ ok: false, error: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body.toString('utf8'));
    const event = payload?.event;
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    const subscriptionId = subscriptionEntity?.id;
    const status = subscriptionEntity?.status;

    if (subscriptionId && ['subscription.activated', 'subscription.charged', 'subscription.completed', 'subscription.cancelled', 'subscription.halted'].includes(event)) {
      const mappedStatus = (status === 'active' || status === 'authenticated') ? 'active' : status === 'cancelled' ? 'canceled' : 'past_due';
      await db
        .update(subscriptions)
        .set({ status: mappedStatus, updatedAt: new Date() })
        .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed', error);
    return res.status(500).json({ ok: false, error: 'Webhook processing failed' });
  }
});

app.use(express.json());
app.use('/api/auth', oauthRouter);

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  if (typeof startCronJobs === 'function') {
    startCronJobs();
  }
});
