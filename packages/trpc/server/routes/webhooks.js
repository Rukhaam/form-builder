import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';
import { db, forms, webhooks, subscriptions } from '@repo/database';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { upsertWebhookSchema, deleteWebhookSchema, testWebhookSchema } from '@repo/schemas';
import { getPlan } from '../utils/plans.js';
import { dispatchWebhook } from '../utils/webhookDispatcher.js';

// Helper to ensure the user owns the form and is on a Pro/Business plan
async function enforceWebhookAccess(ctx, formId) {
  const userId = ctx.user.id;

  const [form] = await db
    .select()
    .from(forms)
    .where(and(eq(forms.id, formId), eq(forms.userId, userId)))
    .limit(1);

  if (!form) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Form not found or unauthorized',
    });
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const planId = sub && ['active', 'trialing'].includes(sub.status) ? sub.planId : 'FREE';
  const plan = getPlan(planId);

  if (plan.tier === 'starter') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Webhooks are only available on Pro and Business plans.',
    });
  }

  return { form, plan };
}

export const webhooksRouter = router({
  get: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      // First, check basic form ownership (without throwing the plan error so the UI can show the locked overlay)
      const userId = ctx.user.id;
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
        .limit(1);

      if (!form) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Form not found' });
      }

      // Determine plan tier for the UI
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);
        
      const planId = sub && ['active', 'trialing'].includes(sub.status) ? sub.planId : 'FREE';
      const plan = getPlan(planId);
      const isLocked = plan.tier === 'starter';

      // Fetch the webhook config
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.formId, input.formId))
        .limit(1);

      return {
        isLocked,
        formTitle: form.title,
        webhook: webhook || null,
      };
    }),

  upsert: protectedProcedure
    .input(upsertWebhookSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceWebhookAccess(ctx, input.formId);

      const [existing] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.formId, input.formId))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(webhooks)
          .set({
            url: input.url,
            secret: input.secret || null,
            isActive: input.isActive,
          })
          .where(eq(webhooks.id, existing.id))
          .returning();
        return { message: 'Webhook updated successfully', webhook: updated };
      } else {
        const [inserted] = await db
          .insert(webhooks)
          .values({
            formId: input.formId,
            url: input.url,
            secret: input.secret || null,
            isActive: input.isActive,
          })
          .returning();
        return { message: 'Webhook created successfully', webhook: inserted };
      }
    }),

  delete: protectedProcedure
    .input(deleteWebhookSchema)
    .mutation(async ({ input, ctx }) => {
      await enforceWebhookAccess(ctx, input.formId);

      await db
        .delete(webhooks)
        .where(eq(webhooks.formId, input.formId));

      return { message: 'Webhook deleted successfully' };
    }),

  test: protectedProcedure
    .input(testWebhookSchema)
    .mutation(async ({ input, ctx }) => {
      const { form } = await enforceWebhookAccess(ctx, input.formId);

      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.formId, input.formId))
        .limit(1);

      if (!webhook) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No webhook configured to test.' });
      }

      // Generate a dummy payload
      const testPayload = {
        event: 'form.submission.test',
        formId: input.formId,
        formTitle: form.title,
        submittedAt: new Date().toISOString(),
        data: {
          'test_field_1': 'Sample short text answer',
          'test_field_2': ['Sample', 'Multi-select', 'Options'],
        }
      };

      // We explicitly await it here so we can return the exact error/success to the UI for testing
      try {
        const { default: crypto } = await import('crypto');
        const body = JSON.stringify(testPayload);
        const headers = { 'Content-Type': 'application/json' };

        if (webhook.secret) {
          const hmac = crypto.createHmac('sha256', webhook.secret);
          hmac.update(body);
          headers['X-FormBuilder-Signature'] = `sha256=${hmac.digest('hex')}`;
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body,
        });

        // Still update the DB state
        await db.update(webhooks)
          .set({ lastTriggeredAt: new Date(), lastStatus: response.status })
          .where(eq(webhooks.id, webhook.id));

        return { 
          message: `Test request sent (Status: ${response.status})`,
          status: response.status
        };
      } catch (error) {
        await db.update(webhooks)
          .set({ lastTriggeredAt: new Date(), lastStatus: 0 })
          .where(eq(webhooks.id, webhook.id));
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to deliver webhook: ${error.message}`
        });
      }
    }),
});
