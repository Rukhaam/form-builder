import express from 'express';
import crypto from 'crypto';
import { db, subscriptions } from '@repo/database';
import { eq } from 'drizzle-orm';

import { getPlanByRazorpayPlanId } from '@repo/trpc/server/utils/plans.js';

const router = express.Router();

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '', 'utf8');
  const rightBuffer = Buffer.from(right || '', 'utf8');

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function dateFromUnix(value) {
  return typeof value === 'number' && value > 0 ? new Date(value * 1000) : null;
}

function fallbackPeriodEnd(plan) {
  const periodEnd = new Date();
  if (plan.billingCycle === 'yearly') {
    periodEnd.setUTCFullYear(periodEnd.getUTCFullYear() + 1);
  } else {
    periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);
  }
  return periodEnd;
}

function normalizeSubscriptionStatus(status) {
  if (status === 'cancelled') return 'canceled';
  if (status === 'halted') return 'past_due';
  if (status === 'authenticated') return 'active';
  return status || 'created';
}

// 🚀 Apply express.raw() explicitly to this route so the signature verification works
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    return res.status(400).json({ ok: false, error: 'Missing webhook secret/signature' });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body) // req.body is a raw Buffer here because of express.raw()
      .digest('hex');

    // Securely compare signatures to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');

    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return res.status(401).json({ ok: false, error: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body.toString('utf8'));
    const event = payload?.event;
    const subscriptionEntity = payload?.payload?.subscription?.entity;

    if (subscriptionEntity && [
      'subscription.authenticated',
      'subscription.activated',
      'subscription.charged',
      'subscription.completed',
      'subscription.cancelled',
      'subscription.halted',
      'subscription.paused',
      'subscription.resumed',
    ].includes(event)) {
      
      const plan = getPlanByRazorpayPlanId(subscriptionEntity.plan_id);
      const userId = subscriptionEntity.notes?.userId;
      const subscriptionId = subscriptionEntity.id;
      const now = new Date();

      const update = {
        status: normalizeSubscriptionStatus(subscriptionEntity.status),
        razorpayCustomerId: subscriptionEntity.customer_id ?? null,
        currentPeriodStart: dateFromUnix(subscriptionEntity.current_start),
        currentPeriodEnd: dateFromUnix(subscriptionEntity.current_end) ?? (plan ? fallbackPeriodEnd(plan) : null),
        cancelAtPeriodEnd: Boolean(subscriptionEntity.cancel_at_cycle_end),
        updatedAt: now,
      };

      if (plan) {
        update.planId = plan.id;
      }

      if (subscriptionId) {
        await db
          .update(subscriptions)
          .set(update)
          .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId));
      }

      if (userId && plan) {
        const [currentSubscription] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId))
          .limit(1);

        const isDifferentActiveSubscription = currentSubscription?.razorpaySubscriptionId
          && currentSubscription.razorpaySubscriptionId !== subscriptionId
          && currentSubscription.status === 'active';

        if (!isDifferentActiveSubscription) {
          await db
            .insert(subscriptions)
            .values({
              userId,
              planId: plan.id,
              status: update.status,
              razorpayCustomerId: update.razorpayCustomerId,
              razorpaySubscriptionId: subscriptionId,
              currentPeriodStart: update.currentPeriodStart ?? now,
              currentPeriodEnd: update.currentPeriodEnd ?? fallbackPeriodEnd(plan),
              cancelAtPeriodEnd: update.cancelAtPeriodEnd,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: subscriptions.userId,
              set: {
                ...update,
                planId: plan.id,
                razorpaySubscriptionId: subscriptionId,
                currentPeriodStart: update.currentPeriodStart ?? now,
                currentPeriodEnd: update.currentPeriodEnd ?? fallbackPeriodEnd(plan),
              },
            });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed', error);
    return res.status(500).json({ ok: false, error: 'Webhook processing failed' });
  }
});

export default router;