import crypto from 'crypto';
import Razorpay from 'razorpay';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, subscriptions, usageCounters } from '@repo/database';
import { protectedProcedure, publicProcedure, router } from '../trpc.js';
import { DEFAULT_PLAN_ID, getPlan, PLAN_DEFINITIONS } from '../utils/plans.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function currentPeriodKey() {
  const now = new Date();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, '0');
  return `${now.getUTCFullYear()}-${month}`;
}

export const billingRouter = router({
  getPlans: publicProcedure.query(() => Object.values(PLAN_DEFINITIONS)),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
    return sub ?? { planId: DEFAULT_PLAN_ID, status: 'active' };
  }),

  createCheckoutOrder: protectedProcedure
    .input(z.object({ planId: z.enum(['PRO', 'STUDIO']) }))
    .mutation(async ({ ctx, input }) => {
      const plan = getPlan(input.planId);
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Razorpay keys are not configured' });
      }

      const order = await razorpay.orders.create({
        amount: plan.amountInPaise,
        currency: plan.currency,
        receipt: `upgrade_${ctx.user.id}_${Date.now()}`,
        notes: { userId: ctx.user.id, targetPlanId: input.planId },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planId: input.planId,
      };
    }),

  confirmPaymentAndActivatePlan: protectedProcedure
    .input(z.object({
      razorpayOrderId: z.string().min(1),
      razorpayPaymentId: z.string().min(1),
      razorpaySignature: z.string().min(1),
      planId: z.enum(['PRO', 'STUDIO']),
    }))
    .mutation(async ({ ctx, input }) => {
      const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      if (expectedSignature !== input.razorpaySignature) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Razorpay signature' });
      }

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1);

      await db
        .insert(subscriptions)
        .values({
          userId: ctx.user.id,
          planId: input.planId,
          status: 'active',
          razorpaySubscriptionId: input.razorpayOrderId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            planId: input.planId,
            status: 'active',
            razorpaySubscriptionId: input.razorpayOrderId,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
          },
        });

      return { success: true, planId: input.planId };
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
});
