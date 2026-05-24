import { router, protectedProcedure, publicProcedure } from "../trpc.js";
import {
  createFormSchema,
  addFieldSchema,
  saveEditorFormSchema,
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
import bcrypt from "bcrypt"; // <-- Added bcrypt for secure hashing

function slugifyTitle(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);

  return slug || "untitled-form";
}

async function createUniqueSlug(title) {
  const baseSlug = slugifyTitle(title);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${baseSlug}-${suffix}`;
    const [existingForm] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1);

    if (!existingForm) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

export const formRouter = router({
  // --- CREATOR ROUTES (PROTECTED) ---

  // 2. Clone a template into the user's account
  createFromTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      // Fetch the template form
      const [templateForm] = await db
        .select()
        .from(forms)
        .where(eq(forms.id, input.templateId))
        .limit(1);

      if (!templateForm) throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });

      // Fetch the template's fields
      const templateFields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, input.templateId));

      // 1. Create the new cloned form for the user
      const slug = await createUniqueSlug(templateForm.title);
      const [newForm] = await db
        .insert(forms)
        .values({
          userId,
          title: templateForm.title,
          description: templateForm.description,
          theme: templateForm.theme, // Copy the theme!
          slug,
          visibility: 'UNLISTED', // Keep it unlisted until they publish
          status: 'DRAFT',
          isTemplate: false, // This is a real form now, not a template
        })
        .returning();

      // 2. Clone all the fields
      if (templateFields.length > 0) {
        const fieldsToInsert = templateFields.map(field => ({
          formId: newForm.id,
          type: field.type,
          label: field.label,
          required: field.required,
          order: field.order,
          options: field.options,
        }));
        await db.insert(formFields).values(fieldsToInsert);
      }

      return { message: "Template cloned successfully", formId: newForm.id };
    }),

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

  getAnalyticsOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const myForms = await db
      .select()
      .from(forms)
      .where(eq(forms.userId, userId))
      .orderBy(desc(forms.createdAt));

    const rows = await Promise.all(
      myForms.map(async (form) => {
        const [submissionTotal] = await db
          .select({ value: count() })
          .from(formSubmissions)
          .where(eq(formSubmissions.formId, form.id));

        const [fieldTotal] = await db
          .select({ value: count() })
          .from(formFields)
          .where(eq(formFields.formId, form.id));

        const [latestSubmission] = await db
          .select({ submittedAt: formSubmissions.submittedAt })
          .from(formSubmissions)
          .where(eq(formSubmissions.formId, form.id))
          .orderBy(desc(formSubmissions.submittedAt))
          .limit(1);

        return {
          ...form,
          submissionCount: submissionTotal?.value ?? 0,
          fieldCount: fieldTotal?.value ?? 0,
          latestSubmittedAt: latestSubmission?.submittedAt ?? null,
        };
      }),
    );

    return rows;
  }),

  saveEditor: protectedProcedure
    .input(saveEditorFormSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const normalizedFields = input.fields.map((field, index) => ({
        ...field,
        order: index,
        options: ["single_select", "multi_select", "checkbox"].includes(field.type)
          ? field.options?.map((option) => option.trim()).filter(Boolean) ?? []
          : null,
      }));

      // Password Hashing Logic
      let hashedPassword = undefined;
      if (input.password !== undefined) {
        if (input.password === null || input.password.trim() === "") {
          hashedPassword = null; // Clear the password
        } else {
          hashedPassword = await bcrypt.hash(input.password, 10);
        }
      }

      let targetForm;

      if (input.formId) {
        const [ownedForm] = await db
          .select()
          .from(forms)
          .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
          .limit(1);

        if (!ownedForm) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found or unauthorized",
          });
        }

        [targetForm] = await db
          .update(forms)
          .set({
            title: input.title,
            description: input.description ?? null,
            visibility: input.visibility,
            status: input.status,
            category: input.category ?? null,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            maxResponses: input.maxResponses ?? null,
            ...(hashedPassword !== undefined && { password: hashedPassword }),
          })
          .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
          .returning();
      } else {
        const slug = await createUniqueSlug(input.title);

        [targetForm] = await db
          .insert(forms)
          .values({
            userId,
            title: input.title,
            description: input.description ?? null,
            slug,
            visibility: input.visibility,
            status: input.status,
            category: input.category ?? null,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
            maxResponses: input.maxResponses ?? null,
            ...(hashedPassword !== undefined && { password: hashedPassword }),
          })
          .returning();
      }

      const existingFields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, targetForm.id));
      const existingFieldIds = new Set(existingFields.map((field) => field.id));
      const incomingFieldIds = new Set(
        normalizedFields.map((field) => field.id).filter(Boolean),
      );

      for (const existingField of existingFields) {
        if (!incomingFieldIds.has(existingField.id)) {
          await db
            .delete(formFields)
            .where(
              and(
                eq(formFields.id, existingField.id),
                eq(formFields.formId, targetForm.id),
              ),
            );
        }
      }

      for (const field of normalizedFields) {
        const values = {
          formId: targetForm.id,
          type: field.type,
          label: field.label,
          required: field.required,
          order: field.order,
          options: field.options,
        };

        if (field.id && existingFieldIds.has(field.id)) {
          await db
            .update(formFields)
            .set(values)
            .where(and(eq(formFields.id, field.id), eq(formFields.formId, targetForm.id)));
        } else {
          const insertValues = field.id ? { id: field.id, ...values } : values;
          await db.insert(formFields).values(insertValues);
        }
      }

      const savedFields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, targetForm.id))
        .orderBy(formFields.order);

      return {
        message: input.formId ? "Form updated successfully" : "Form created successfully",
        form: targetForm,
        fields: savedFields,
      };
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

  getTemplates: publicProcedure.query(async () => {
    const templates = await db
      .select()
      .from(forms)
      .where(eq(forms.isTemplate, true))
      .orderBy(desc(forms.createdAt));
    return templates;
  }),

  // --- RESPONDER ROUTES (PUBLIC) ---

  getPublicForms: publicProcedure.query(async () => {
    const publicForms = await db
      .select()
      .from(forms)
      .where(and(eq(forms.visibility, "PUBLIC"), eq(forms.status, "PUBLISHED"), eq(forms.isExpired, false)))
      .orderBy(desc(forms.createdAt));

    const rows = await Promise.all(
      publicForms.map(async (form) => {
        const [fieldTotal] = await db
          .select({ value: count() })
          .from(formFields)
          .where(eq(formFields.formId, form.id));

        const [submissionTotal] = await db
          .select({ value: count() })
          .from(formSubmissions)
          .where(eq(formSubmissions.formId, form.id));

        return {
          id: form.id,
          title: form.title,
          description: form.description,
          slug: form.slug,
          createdAt: form.createdAt,
          fieldCount: fieldTotal?.value ?? 0,
          submissionCount: submissionTotal?.value ?? 0,
          isProtected: !!form.password, // Let the directory know if it's locked
        };
      }),
    );

    return rows;
  }),

  getPublicFormBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const [form] = await db
        .select()
        .from(forms)
        .where(and(eq(forms.slug, input.slug), eq(forms.visibility, "PUBLIC"), eq(forms.status, "PUBLISHED")))
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

      // Safe Form Object (Never leak the hashed password to the frontend!)
      const safeForm = {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
      };

      // GATEKEEPER: If password exists, scrub the fields and return locked state
      if (form.password) {
        return {
          form: safeForm,
          fields: [],
          isProtected: true, 
        };
      }

      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, form.id))
        .orderBy(formFields.order);

      return {
        form: safeForm,
        fields,
        isProtected: false,
      };
    }),

  // NEW ROUTE: Unlock a password-protected form
  verifyFormPassword: publicProcedure
    .input(
      z.object({
        formId: z.string().uuid(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const [form] = await db
        .select()
        .from(forms)
        .where(eq(forms.id, input.formId))
        .limit(1);

      if (!form || !form.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Form is not protected or does not exist",
        });
      }

      const isValid = await bcrypt.compare(input.password, form.password);
      
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect password",
        });
      }

      // Unlock successful! Fetch and return the protected fields
      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, form.id))
        .orderBy(formFields.order);

      return { fields };
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
      if (form.visibility !== "PUBLIC" || form.status !== "PUBLISHED") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not accepting public responses",
        });
      }
      if (form.isExpired || (form.expiresAt && new Date() > form.expiresAt)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is no longer accepting responses",
        });
      }

      // Check max responses limit
      if (form.maxResponses !== null) {
        const [{ value }] = await db
          .select({ value: count() })
          .from(formSubmissions)
          .where(eq(formSubmissions.formId, form.id));
        
        if (value >= form.maxResponses) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This form has reached its maximum number of responses",
          });
        }
      }

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