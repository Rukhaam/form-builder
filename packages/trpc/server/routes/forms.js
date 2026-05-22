import { router, protectedProcedure, publicProcedure } from "../trpc.js";
import {
  createFormSchema,
  addFieldSchema,
  submitFormSchema,
} from "@repo/schemas";
import {
  db,
  forms,
  formFields,
  formSubmissions,
  fieldResponses,
} from "@repo/database";
import { eq, and, inArray, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const formRouter = router({
  // --- CREATOR ROUTES (PROTECTED) ---

  create: protectedProcedure
    .input(createFormSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [newForm] = await db
        .insert(forms)
        .values({
          userId: userId,
          title: input.title,
          description: input.description,
          slug: input.slug,
          theme: input.theme,
          visibility: input.visibility,
          isExpired: input.isExpired,
          expiresAt: input.expiresAt,
        })
        .returning();

      return { message: "Form created successfully", form: newForm };
    }),

  getMyForms: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const myForms = await db
      .select()
      .from(forms)
      .where(eq(forms.userId, userId));
    return myForms;
  }),

  addField: protectedProcedure
    .input(addFieldSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
        .limit(1);

      if (!form) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to edit this form, or it does not exist.",
        });
      }

      const [newField] = await db
        .insert(formFields)
        .values({
          formId: input.formId,
          type: input.type,
          label: input.label,
          required: input.required,
          order: input.order,
          options: input.options,
        })
        .returning();

      return { message: "Field added successfully", field: newField };
    }),

  getFormEditor: protectedProcedure
    .input(z.object({ formId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
        .limit(1);

      if (!form)
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, input.formId))
        .orderBy(formFields.order);

      return { form, fields };
    }),
  // --- ADD THIS TO YOUR CREATOR ROUTES (PROTECTED) ---

  getFormAnalytics: protectedProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { formId, page, limit } = input;
      const userId = ctx.user.id;

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

      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, formId))
        .orderBy(formFields.order);

      const [totalRecord] = await db
        .select({ value: count() })
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId));

      const totalSubmissions = totalRecord.value;
      const totalPages = Math.ceil(totalSubmissions / limit);

      const offset = (page - 1) * limit;

      const submissions = await db
        .select()
        .from(formSubmissions)
        .where(eq(formSubmissions.formId, formId))
        .orderBy(desc(formSubmissions.submittedAt))
        .limit(limit)
        .offset(offset);

      if (submissions.length === 0) {
        return {
          form,
          fields,
          submissions: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }
      const submissionIds = submissions.map((sub) => sub.id);
      const responses = await db
        .select()
        .from(fieldResponses)
        .where(inArray(fieldResponses.submissionId, submissionIds));

      // 6. Data Transformation
      const formattedSubmissions = submissions.map((sub) => {
        const answersForThisSub = responses.filter(
          (r) => r.submissionId === sub.id,
        );

        const answersRecord = answersForThisSub.reduce((acc, curr) => {
          let finalValue = curr.value;

          if (
            typeof curr.value === "string" &&
            (curr.value.startsWith("[") || curr.value.startsWith("{"))
          ) {
            try {
              finalValue = JSON.parse(curr.value);
            } catch (e) {}
          }

          acc[curr.fieldId] = finalValue;
          return acc;
        }, {});

        return {
          id: sub.id,
          submittedAt: sub.submittedAt,
          answers: answersRecord,
        };
      });

      return {
        form,
        fields,
        submissions: formattedSubmissions,
        pagination: {
          total: totalSubmissions,
          page,
          limit,
          totalPages,
        },
      };
    }),
  // --- RESPONDER ROUTES (PUBLIC) ---

  getPublicFormBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.slug, input.slug), eq(forms.visibility, "PUBLIC")))
        .limit(1);

      if (!form)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or is private",
        });
      if (form.isExpired || (form.expiresAt && new Date() > form.expiresAt)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is no longer accepting responses",
        });
      }

      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, form.id))
        .orderBy(formFields.order);

      return {
        form: {
          id: form.id,
          title: form.title,
          description: form.description,
          theme: form.theme,
        },
        fields,
      };
    }),

  submitResponse: publicProcedure
    .input(submitFormSchema)
    .mutation(async ({ input }) => {
      const [form] = await db
        .select()
        .from(forms)
        .where(eq(forms.id, input.formId))
        .limit(1);
      if (!form)
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      const [newSubmission] = await db
        .insert(formSubmissions)
        .values({
          formId: input.formId,
        })
        .returning();

      const answersToInsert = Object.entries(input.answers).map(
        ([fieldId, value]) => ({
          submissionId: newSubmission.id,
          fieldId: fieldId,
          value: typeof value === "string" ? value : JSON.stringify(value),
        }),
      );

      if (answersToInsert.length > 0) {
        await db.insert(fieldResponses).values(answersToInsert);
      }

      return { message: "Response submitted successfully!" };
    }),
});
