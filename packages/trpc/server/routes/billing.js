import crypto from 'crypto';
import { TRPCError } from '@trpc/server';
import { and, eq, count} from 'drizzle-orm';
import { z } from 'zod';
import { db, subscriptions, usageCounters,forms } from '@repo/database';
import { protectedProcedure, publicProcedure, router } from '../trpc.js';
import {
  DEFAULT_PLAN_ID,
  getPaidPlan,
  getPlan,
  getPlanByRazorpayPlanId,
  PAID_PLAN_IDS,
  PLAN_DEFINITIONS,
} from '../utils/plans.js';

const paidPlanIdSchema = z.enum(PAID_PLAN_IDS);
const ACTIVE_RAZORPAY_STATUSES = new Set(['authenticated', 'active']);
const BLOCKING_SUBSCRIPTION_STATUSES = new Set(['created', 'authenticated', 'active', 'pending']);

function currentPeriodKey() {
  const now = new Date();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
}

function requireRazorpayConfig() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Razorpay keys are not configured' });
  }
}

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '', 'utf8');
  const rightBuffer = Buffer.from(right || '', 'utf8');

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifySubscriptionSignature({ subscriptionId, paymentId, signature }) {
  requireRazorpayConfig();

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex');

  if (!timingSafeEqual(expectedSignature, signature)) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Razorpay signature' });
  }
}

async function razorpayRequest(path, { method = 'GET', body } = {}) {
  requireRazorpayConfig();

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.description || payload?.message || 'Razorpay request failed';
    const code = response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST';
    throw new TRPCError({ code, message });
  }

  return payload;
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
  return status || 'created';
}

async function activateSubscription({ userId, plan, subscription }) {
  const now = new Date();
  const currentPeriodStart = dateFromUnix(subscription.current_start) ?? now;
  const currentPeriodEnd = dateFromUnix(subscription.current_end) ?? fallbackPeriodEnd(plan);
  const status = normalizeSubscriptionStatus(subscription.status);

  await db
    .insert(subscriptions)
    .values({
      userId,
      planId: plan.id,
      status: ACTIVE_RAZORPAY_STATUSES.has(subscription.status) ? 'active' : status,
      razorpayCustomerId: subscription.customer_id ?? null,
      razorpaySubscriptionId: subscription.id,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_cycle_end),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        planId: plan.id,
        status: ACTIVE_RAZORPAY_STATUSES.has(subscription.status) ? 'active' : status,
        razorpayCustomerId: subscription.customer_id ?? null,
        razorpaySubscriptionId: subscription.id,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_cycle_end),
        updatedAt: now,
      },
    });
}

export const billingRouter = router({
  getPlans: publicProcedure.query(() => Object.values(PLAN_DEFINITIONS)),


  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
    

    const plan = getPlan(sub?.planId ?? DEFAULT_PLAN_ID);
    
    return {
      subscription: sub ?? null,
      plan,
      isActive: sub ? ACTIVE_RAZORPAY_STATUSES.has(sub.status) : false,
    };
  }),

  createCheckoutSubscription: protectedProcedure
    .input(z.object({ planId: paidPlanIdSchema }))
    .mutation(async ({ ctx, input }) => {
      const plan = getPaidPlan(input.planId);
      if (!plan) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid paid plan selected' });
      }

      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (
        existingSubscription?.razorpaySubscriptionId &&
        BLOCKING_SUBSCRIPTION_STATUSES.has(existingSubscription.status) &&
        getPlan(existingSubscription.planId).id === plan.id
      ) {
        throw new TRPCError({ code: 'CONFLICT', message: 'You are already subscribed to this plan.' });
      }

      const subscription = await razorpayRequest('/subscriptions', {
        method: 'POST',
        body: {
          plan_id: plan.razorpayPlanId,
          total_count: plan.totalCount,
          quantity: 1,
          customer_notify: true,
          expire_by: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
          notes: {
            userId: ctx.user.id,
            email: ctx.user.email ?? '',
            internalPlanId: plan.id,
            tier: plan.tier,
            billingCycle: plan.billingCycle,
          },
        },
      });

      return {
        keyId: process.env.RAZORPAY_KEY_ID,
        subscriptionId: subscription.id,
        shortUrl: subscription.short_url,
        plan: {
          id: plan.id,
          name: plan.name,
          billingCycle: plan.billingCycle,
          amountInPaise: plan.amountInPaise,
          currency: plan.currency,
          displayPrice: plan.displayPrice,
          cadence: plan.cadence,
        },
      };
    }),

  confirmCheckoutSubscription: protectedProcedure
    .input(z.object({
      planId: paidPlanIdSchema,
      razorpaySubscriptionId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const plan = getPaidPlan(input.planId);
      if (!plan) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid paid plan selected' });
      }

      verifySubscriptionSignature({
        subscriptionId: input.razorpaySubscriptionId,
        paymentId: input.razorpayPaymentId,
        signature: input.razorpaySignature,
      });

      const subscription = await razorpayRequest(`/subscriptions/${input.razorpaySubscriptionId}`);
      const subscriptionPlan = getPlanByRazorpayPlanId(subscription.plan_id);

      if (!subscriptionPlan || subscriptionPlan.id !== plan.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Razorpay subscription does not match the selected plan.' });
      }

      if (subscription.notes?.userId !== ctx.user.id || subscription.notes?.internalPlanId !== plan.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Razorpay subscription ownership check failed.' });
      }

      await activateSubscription({ userId: ctx.user.id, plan, subscription });

      return { success: true, planId: plan.id };
    }),

getUsageOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const periodKey = currentPeriodKey();


    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const planId = sub && ['active', 'trialing'].includes(sub.status) ? sub.planId : 'FREE';
    const plan = getPlan(planId); // Ensure you are using getPlan from your plans.js

    const [formCountResult] = await db
      .select({ count: count() })
      .from(forms)
      .where(eq(forms.userId, userId));
    
    const formsUsed = formCountResult?.count || 0;


    const [responseCounter] = await db
      .select({ usedCount: usageCounters.usedCount })
      .from(usageCounters)
      .where(
        and(
          eq(usageCounters.userId, userId),
          eq(usageCounters.metric, 'responses_collected'),
          eq(usageCounters.periodKey, periodKey)
        )
      )
      .limit(1);

    const responsesUsed = responseCounter?.usedCount || 0;

    // Map limits based on plan definitions
    const formLimit = plan.limits?.max_forms ?? 3;
    const responseLimit = plan.limits?.max_responses_per_month ?? 100;

    return {
      forms: {
        used: formsUsed,
        limit: formLimit,
        isUnlimited: formLimit >= 999999,
        percentage: Math.min((formsUsed / formLimit) * 100, 100)
      },
      responses: {
        used: responsesUsed,
        limit: responseLimit,
        isUnlimited: responseLimit >= 999999,
        percentage: Math.min((responsesUsed / responseLimit) * 100, 100),
        periodKey
      }
    };
  }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const periodKey = currentPeriodKey();
    const [formsCount] = await db.select().from(usageCounters).where(and(
      eq(usageCounters.userId, ctx.user.id),
      eq(usageCounters.metric, 'forms_created'),
      eq(usageCounters.periodKey, 'LIFETIME'),
    )).limit(1);

    const [responsesCount] = await db.select().from(usageCounters).where(and(
      eq(usageCounters.userId, ctx.user.id),
      eq(usageCounters.metric, 'responses_collected'),
      eq(usageCounters.periodKey, periodKey),
    )).limit(1);

    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
    const plan = getPlan(sub?.planId ?? DEFAULT_PLAN_ID);

    return {
      plan,
      usage: {
        formsCreated: formsCount?.usedCount ?? 0,
        responsesCollected: responsesCount?.usedCount ?? 0,
      },
    };
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    if (!sub || !sub.razorpaySubscriptionId || !ACTIVE_RAZORPAY_STATUSES.has(sub.status)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active subscription found to cancel' });
    }

    // Ping Razorpay: cancel_at_cycle_end = 1 keeps the sub active until the prepaid period is over
    await razorpayRequest(`/subscriptions/${sub.razorpaySubscriptionId}/cancel`, {
      method: 'POST',
      body: { cancel_at_cycle_end: 1 },
    });

    // Update Local DB
    await db
      .update(subscriptions)
      .set({ cancelAtPeriodEnd: true })
      .where(eq(subscriptions.id, sub.id));

    return { success: true, message: 'Subscription will be canceled at the end of the billing period.' };
  }),
});