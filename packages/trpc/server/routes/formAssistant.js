import "../utils/loadEnv.js";
import { router, protectedProcedure } from "../trpc.js";
import {
  aiAssistantConversations,
  aiAssistantMessages,
  db,
  formFields,
  forms,
  subscriptions,
  usageCounters,
} from "@repo/database";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { checkRateLimit, checkUserRateLimit } from "../utils/rateLimit.js";
import { generateFormFromPrompt } from "../utils/formAssistant.js";
import { DEFAULT_PLAN_ID, getPlan, hasUnlimited } from "../utils/plans.js";

const AI_PROMPT_METRIC = "ai_form_prompts";
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

function weekStart(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - weekday);
  return start;
}

function weeklyPeriodKey(date = new Date()) {
  return weekStart(date).toISOString().slice(0, 10);
}

function weeklyResetAt(date = new Date()) {
  const resetAt = weekStart(date);
  resetAt.setUTCDate(resetAt.getUTCDate() + 7);
  return resetAt;
}

function conversationTitle(prompt) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  return normalized.length > 56 ? `${normalized.slice(0, 56).trimEnd()}…` : normalized;
}

function slugifyTitle(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return slug || "untitled-form";
}

async function createUniqueSlug(title, client = db) {
  const baseSlug = slugifyTitle(title);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
    const [existing] = await client
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1);

    if (!existing) return slug;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

async function getCurrentPlan(userId) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const planId = subscription && ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)
    ? subscription.planId
    : DEFAULT_PLAN_ID;

  return getPlan(planId);
}

async function enforceFormCreationLimit(userId, client = db) {
  const plan = await getCurrentPlan(userId);
  if (hasUnlimited(plan.maxForms)) return;

  const [aggregate] = await client
    .select({ total: count(forms.id) })
    .from(forms)
    .where(eq(forms.userId, userId));

  if (Number(aggregate?.total ?? 0) >= plan.maxForms) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Form limit reached for ${plan.name}. Upgrade to create more forms.`,
    });
  }
}

async function incrementFormsUsage(userId, client = db) {
  await client
    .insert(usageCounters)
    .values({
      userId,
      metric: "forms_created",
      periodKey: "LIFETIME",
      usedCount: 1,
    })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.metric, usageCounters.periodKey],
      set: {
        usedCount: sql`${usageCounters.usedCount} + 1`,
        updatedAt: new Date(),
      },
    });
}

async function consumeWeeklyPrompt(userId, limit) {
  const periodKey = weeklyPeriodKey();
  const rows = await db
    .insert(usageCounters)
    .values({
      userId,
      metric: AI_PROMPT_METRIC,
      periodKey,
      usedCount: 1,
    })
    .onConflictDoUpdate({
      target: [usageCounters.userId, usageCounters.metric, usageCounters.periodKey],
      set: {
        usedCount: sql`${usageCounters.usedCount} + 1`,
        updatedAt: new Date(),
      },
      where: sql`${usageCounters.usedCount} < ${limit}`,
    })
    .returning({ usedCount: usageCounters.usedCount });

  return rows[0] ?? null;
}

async function getPromptUsage(userId, plan) {
  const periodKey = weeklyPeriodKey();
  const [counter] = await db
    .select({ usedCount: usageCounters.usedCount })
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.userId, userId),
        eq(usageCounters.metric, AI_PROMPT_METRIC),
        eq(usageCounters.periodKey, periodKey),
      ),
    )
    .limit(1);

  const limit = plan.aiFormPromptsPerWeek ?? 1;
  const used = Math.min(counter?.usedCount ?? 0, limit);

  return {
    plan: { id: plan.id, name: plan.name, tier: plan.tier },
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    periodKey,
    resetsAt: weeklyResetAt(),
  };
}

async function getOwnedConversation(conversationId, userId) {
  const [conversation] = await db
    .select()
    .from(aiAssistantConversations)
    .where(
      and(
        eq(aiAssistantConversations.id, conversationId),
        eq(aiAssistantConversations.userId, userId),
      ),
    )
    .limit(1);

  if (!conversation) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Assistant conversation not found." });
  }

  return conversation;
}

export const formAssistantRouter = router({
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const plan = await getCurrentPlan(ctx.user.id);
    return getPromptUsage(ctx.user.id, plan);
  }),

  listConversations: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select({
        id: aiAssistantConversations.id,
        title: aiAssistantConversations.title,
        formId: aiAssistantConversations.formId,
        createdAt: aiAssistantConversations.createdAt,
        updatedAt: aiAssistantConversations.updatedAt,
      })
      .from(aiAssistantConversations)
      .where(eq(aiAssistantConversations.userId, ctx.user.id))
      .orderBy(desc(aiAssistantConversations.updatedAt));
  }),

  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const conversation = await getOwnedConversation(input.conversationId, ctx.user.id);
      const messages = await db
        .select()
        .from(aiAssistantMessages)
        .where(eq(aiAssistantMessages.conversationId, conversation.id))
        .orderBy(aiAssistantMessages.createdAt);

      return { conversation, messages };
    }),

  generate: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid().optional(),
      prompt: z.string().trim().min(12, "Describe what you need in at least 12 characters.").max(4000),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [ipLimit, userLimit] = await Promise.all([
        checkRateLimit(ctx.req, { namespace: "ai-form-assistant", limit: 10, windowSeconds: 15 * 60 }),
        checkUserRateLimit(userId, { namespace: "ai-form-assistant", limit: 8, windowSeconds: 60 * 60 }),
      ]);

      if (!ipLimit.allowed || !userLimit.allowed) {
        const retryAfter = Math.max(ipLimit.retryAfter ?? 0, userLimit.retryAfter ?? 0);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Please wait ${Math.max(1, Math.ceil(retryAfter / 60))} minute(s) before generating another form.`,
        });
      }

      await enforceFormCreationLimit(userId);

      const plan = await getCurrentPlan(userId);
      const promptLimit = plan.aiFormPromptsPerWeek ?? 1;
      const usage = await consumeWeeklyPrompt(userId, promptLimit);
      if (!usage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `${plan.name} includes ${promptLimit} form-assistant prompt${promptLimit === 1 ? "" : "s"} per week. Your limit resets on ${weeklyResetAt().toLocaleDateString()}.`,
        });
      }

      let conversation;
      if (input.conversationId) {
        conversation = await getOwnedConversation(input.conversationId, userId);
      } else {
        [conversation] = await db
          .insert(aiAssistantConversations)
          .values({ userId, title: conversationTitle(input.prompt) })
          .returning();
      }

      const priorMessages = await db
        .select({ role: aiAssistantMessages.role, content: aiAssistantMessages.content })
        .from(aiAssistantMessages)
        .where(eq(aiAssistantMessages.conversationId, conversation.id))
        .orderBy(desc(aiAssistantMessages.createdAt))
        .limit(12);

      await db.insert(aiAssistantMessages).values({
        conversationId: conversation.id,
        role: "user",
        content: input.prompt,
      });

      let draft;
      try {
        draft = await generateFormFromPrompt({
          history: priorMessages.reverse(),
          prompt: input.prompt,
        });
      } catch (error) {
        console.error("[Form assistant] Generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "I couldn't create a form from that request. Please try again.",
        });
      }

      let createdForm;
      try {
        await db.transaction(async (tx) => {
          await enforceFormCreationLimit(userId, tx);
          const slug = await createUniqueSlug(draft.title, tx);
          [createdForm] = await tx
            .insert(forms)
            .values({
              userId,
              title: draft.title,
              description: draft.description || null,
              slug,
              status: "DRAFT",
              visibility: "UNLISTED",
              theme: "light",
            })
            .returning();

          await tx.insert(formFields).values(
            draft.fields.map((field, order) => ({
              formId: createdForm.id,
              type: field.type,
              label: field.label,
              required: field.required,
              order,
              options: ["single_select", "multi_select", "checkbox"].includes(field.type)
                ? field.options.length >= 2 ? field.options : ["Option 1", "Option 2"]
                : null,
            })),
          );

          await incrementFormsUsage(userId, tx);
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Form assistant] Draft creation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Your form draft could not be saved. Please try again.",
        });
      }

      const assistantContent = `I've created a draft for “${draft.title}” with ${draft.fields.length} focused fields. You can open it in the editor to refine questions, settings, and publishing.`;
      const now = new Date();
      const [assistantMessage] = await db
        .insert(aiAssistantMessages)
        .values({
          conversationId: conversation.id,
          role: "assistant",
          content: assistantContent,
          formId: createdForm.id,
          formSnapshot: draft,
        })
        .returning();

      await db
        .update(aiAssistantConversations)
        .set({ title: draft.title, formId: createdForm.id, updatedAt: now })
        .where(eq(aiAssistantConversations.id, conversation.id));

      return {
        conversationId: conversation.id,
        message: assistantMessage,
        form: { id: createdForm.id, title: createdForm.title },
        usage: await getPromptUsage(userId, plan),
      };
    }),
});
