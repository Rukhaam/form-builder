import "../utils/loadEnv.js";
import { router, protectedProcedure } from "../trpc.js";
import {
  db,
  forms,
  formFields,
  formSubmissions,
  fieldResponses,
  aiSummaries,
  subscriptions,
} from "@repo/database";
import { eq, and, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createHash } from "crypto";
import { analyzeTextResponses } from "../utils/gemini.js";
import { getPlan, DEFAULT_PLAN_ID } from "../utils/plans.js";

const TEXT_FIELD_TYPES = ["short_text", "long_text"];
const MAX_RESPONSES_PER_FIELD = 200;

function computeResponsesHash(fieldResponseData) {
  const content = fieldResponseData
    .map(({ fieldLabel, responses }) => `${fieldLabel}::${responses.join("|")}`)
    .join("|||");
  return createHash("sha256").update(content).digest("hex");
}

export const aiRouter = router({
  /**
   * Get AI-generated insights for text responses on a form.
   * - Verifies ownership and plan tier
   * - Uses hash-based caching to avoid unnecessary API calls
   */
  getTextInsights: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { formId } = input;

      // 1. Verify ownership
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.userId, userId)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or unauthorized",
        });
      }

      // 2. Check plan tier (Pro/Business only)
      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      const plan = getPlan(sub?.planId ?? DEFAULT_PLAN_ID);
      if (plan.tier === "starter") {
        return {
          available: false,
          locked: true,
          reason: "Upgrade to Pro or Business to unlock AI-powered insights.",
        };
      }

      // 3. Fetch text fields for this form
      const textFields = await db
        .select()
        .from(formFields)
        .where(
          and(
            eq(formFields.formId, formId),
            inArray(formFields.type, TEXT_FIELD_TYPES),
          ),
        );

      if (textFields.length === 0) {
        return {
          available: false,
          locked: false,
          reason: "This form has no text fields to analyze.",
        };
      }

      const textFieldIds = textFields.map((f) => f.id);

      // 4. Fetch all submissions for this form (to get submission IDs)
      const allSubmissions = await db
        .select({ id: formSubmissions.id })
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId))
        .orderBy(desc(formSubmissions.submittedAt));

      if (allSubmissions.length === 0) {
        return {
          available: false,
          locked: false,
          reason: "No submissions yet. Collect some responses first.",
        };
      }

      const submissionIds = allSubmissions.map((s) => s.id);

      // 5. Fetch text responses
      const textResponses = await db
        .select()
        .from(fieldResponses)
        .where(
          and(
            inArray(fieldResponses.submissionId, submissionIds),
            inArray(fieldResponses.fieldId, textFieldIds),
          ),
        );

      // Group responses by field
      const fieldResponseData = textFields
        .map((field) => ({
          fieldLabel: field.label,
          responses: textResponses
            .filter((r) => r.fieldId === field.id && r.value.trim() !== "")
            .map((r) => r.value)
            .slice(0, MAX_RESPONSES_PER_FIELD),
        }))
        .filter((f) => f.responses.length > 0);

      if (fieldResponseData.length === 0) {
        return {
          available: false,
          locked: false,
          reason: "No text responses to analyze yet.",
        };
      }

      // 6. Compute hash and check cache
      const currentHash = computeResponsesHash(fieldResponseData);

      const [cached] = await db
        .select()
        .from(aiSummaries)
        .where(eq(aiSummaries.formId, formId))
        .limit(1);

      if (cached && cached.responsesHash === currentHash) {
        return {
          available: true,
          locked: false,
          summary: cached.summary,
          themes: cached.themes,
          sentiment: cached.sentiment,
          generatedAt: cached.updatedAt,
          submissionCount: cached.submissionCount,
          fromCache: true,
        };
      }

      // 7. Call Gemini API
      let analysis;
      try {
        analysis = await analyzeTextResponses(fieldResponseData);
      } catch (err) {
        console.error("[AI] Gemini analysis failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI analysis failed. Please try again later.",
        });
      }

      // 8. Upsert cache
      const now = new Date();
      const upsertValues = {
        formId,
        summary: analysis.summary,
        themes: analysis.themes,
        sentiment: analysis.sentiment,
        responsesHash: currentHash,
        submissionCount: allSubmissions.length,
        updatedAt: now,
      };

      if (cached) {
        await db
          .update(aiSummaries)
          .set(upsertValues)
          .where(eq(aiSummaries.formId, formId));
      } else {
        await db
          .insert(aiSummaries)
          .values({ ...upsertValues, createdAt: now });
      }

      return {
        available: true,
        locked: false,
        summary: analysis.summary,
        themes: analysis.themes,
        sentiment: analysis.sentiment,
        generatedAt: now,
        submissionCount: allSubmissions.length,
        fromCache: false,
      };
    }),

  /**
   * Force-regenerate AI insights (invalidates cache).
   */
  regenerateInsights: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const { formId } = input;

      // Verify ownership
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, formId), eq(forms.userId, userId)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or unauthorized",
        });
      }

      // Delete cached entry to force regeneration
      await db.delete(aiSummaries).where(eq(aiSummaries.formId, formId));

      return { success: true };
    }),
});
