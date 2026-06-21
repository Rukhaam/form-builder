import crypto from 'crypto';
import { db, webhooks } from '@repo/database';
import { eq } from 'drizzle-orm';

/**
 * Dispatch a webhook payload to the configured URL for a form.
 * This function should NOT be awaited in the main request path (fire-and-forget).
 *
 * @param {string} formId The ID of the form.
 * @param {object} payload The JSON payload to send.
 */
export async function dispatchWebhook(formId, payload) {
  try {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.formId, formId))
      .limit(1);

    if (!webhook || !webhook.isActive) {
      return;
    }

    const body = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
    };

    if (webhook.secret) {
      const hmac = crypto.createHmac('sha256', webhook.secret);
      hmac.update(body);
      const signature = hmac.digest('hex');
      headers['X-FormBuilder-Signature'] = `sha256=${signature}`;
    }

    // Fire the POST request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body,
    });

    // Update webhook status
    await db
      .update(webhooks)
      .set({
        lastTriggeredAt: new Date(),
        lastStatus: response.status,
      })
      .where(eq(webhooks.id, webhook.id));

  } catch (error) {
    console.error(`[Webhook Error] Failed to dispatch for form ${formId}:`, error);
    
    // Attempt to record a 0 status for failure if we can
    try {
      await db
        .update(webhooks)
        .set({
          lastTriggeredAt: new Date(),
          lastStatus: 0,
        })
        .where(eq(webhooks.formId, formId));
    } catch (dbError) {
      // Ignore inner db error
    }
  }
}
