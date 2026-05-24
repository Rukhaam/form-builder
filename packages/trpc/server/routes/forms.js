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
import { eq, and, inArray, desc, count, sql } from "drizzle-orm"; // <-- Added 'sql' for subqueries
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const FORM_UNLOCK_TOKEN_TTL_SECONDS = 10 * 60;

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
  createFromTemplate: protectedProcedure
    .input(z.object({ templateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;

      const [templateForm] = await db
        .select()
        .from(forms)
        .where(eq(forms.id, input.templateId))
        .limit(1);

      if (!templateForm) throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });

      const templateFields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, input.templateId));

      const slug = await createUniqueSlug(templateForm.title);
      
      let newFormId;

      await db.transaction(async (tx) => {
        const [newForm] = await tx
          .insert(forms)
          .values({
            userId,
            title: templateForm.title,
            description: templateForm.description,
            theme: templateForm.theme,
            slug,
            visibility: 'UNLISTED',
            status: 'DRAFT',
            isTemplate: false,
          })
          .returning();

        newFormId = newForm.id;

        if (templateFields.length > 0) {
          const fieldsToInsert = templateFields.map(field => ({
            formId: newForm.id,
            type: field.type,
            label: field.label,
            required: field.required,
            order: field.order,
            options: field.options,
          }));
          await tx.insert(formFields).values(fieldsToInsert);
        }
      });

      return { message: "Template cloned successfully", formId: newFormId };
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

  // 🚀 FIX: Solved N+1 query problem using subqueries in a single call
  getAnalyticsOverview: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const rows = await db
      .select({
        form: forms,
        submissionCount: sql`(SELECT COUNT(*)::int FROM ${formSubmissions} WHERE ${formSubmissions.formId} = ${forms.id})`.mapWith(Number),
        fieldCount: sql`(SELECT COUNT(*)::int FROM ${formFields} WHERE ${formFields.formId} = ${forms.id})`.mapWith(Number),
        latestSubmittedAt: sql`(SELECT MAX(${formSubmissions.submittedAt}) FROM ${formSubmissions} WHERE ${formSubmissions.formId} = ${forms.id})`,
      })
      .from(forms)
      .where(eq(forms.userId, userId))
      .orderBy(desc(forms.createdAt));

    return rows.map((row) => ({
      ...row.form,
      submissionCount: row.submissionCount ?? 0,
      fieldCount: row.fieldCount ?? 0,
      latestSubmittedAt: row.latestSubmittedAt ?? null,
    }));
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

      let hashedPassword = undefined;
      if (input.password !== undefined) {
        if (input.password === null || input.password.trim() === "") {
          hashedPassword = null;
        } else {
          hashedPassword = await bcrypt.hash(input.password, 10);
        }
      }

      let targetForm;
      
      const formPayload = {
        title: input.title,
        description: input.description ?? null,
        visibility: input.visibility,
        status: input.status,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        maxResponses: input.maxResponses ?? null,
        theme: input.theme ?? "light",          
        isTemplate: input.isTemplate ?? false,  
        category: input.category ?? null,       
        ...(hashedPassword !== undefined && { password: hashedPassword }),
      };

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
          .set(formPayload) 
          .where(and(eq(forms.id, input.formId), eq(forms.userId, userId)))
          .returning();
      } else {
        const slug = await createUniqueSlug(input.title);

        [targetForm] = await db
          .insert(forms)
          .values({
            userId,
            slug,
            ...formPayload, 
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

      await db.transaction(async (tx) => {
        for (const existingField of existingFields) {
          if (!incomingFieldIds.has(existingField.id)) {
            await tx
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
            await tx
              .update(formFields)
              .set(values)
              .where(and(eq(formFields.id, field.id), eq(formFields.formId, targetForm.id)));
          } else {
            const insertValues = field.id ? { id: field.id, ...values } : values;
            await tx.insert(formFields).values(insertValues);
          }
        }
      });

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


  getTemplates: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(12),
      }).default({ page: 1, limit: 12 })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const [totalRecord] = await db
        .select({ value: count() })
        .from(forms)
        .where(eq(forms.isTemplate, true));

      const total = totalRecord.value;
      const totalPages = Math.ceil(total / limit);

      const data = await db
        .select({
          id: forms.id,
          title: forms.title,
          description: forms.description,
          theme: forms.theme,
          category: forms.category,
          slug: forms.slug,
        }) 
        .from(forms)
        .where(eq(forms.isTemplate, true))
        .orderBy(desc(forms.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        templates: data,
        pagination: { total, page, limit, totalPages }
      };
    }),


  getPublicForms: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(12),
      }).default({ page: 1, limit: 12 })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      const condition = and(
        eq(forms.visibility, "PUBLIC"), 
        eq(forms.status, "PUBLISHED"), 
        eq(forms.isExpired, false)
      );

      const [totalRecord] = await db
        .select({ value: count() })
        .from(forms)
        .where(condition);

      const total = totalRecord.value;
      const totalPages = Math.ceil(total / limit);

      const rawForms = await db
        .select({
          id: forms.id,
          title: forms.title,
          description: forms.description,
          slug: forms.slug,
          createdAt: forms.createdAt,
          password: forms.password,
          fieldCount: sql`(SELECT COUNT(*)::int FROM ${formFields} WHERE ${formFields.formId} = ${forms.id})`.mapWith(Number),
          submissionCount: sql`(SELECT COUNT(*)::int FROM ${formSubmissions} WHERE ${formSubmissions.formId} = ${forms.id})`.mapWith(Number),
        })
        .from(forms)
        .where(condition)
        .orderBy(desc(forms.createdAt))
        .limit(limit)
        .offset(offset);

      const mappedForms = rawForms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        createdAt: form.createdAt,
        fieldCount: form.fieldCount ?? 0,
        submissionCount: form.submissionCount ?? 0,
        isProtected: !!form.password, 
      }));

      return {
        forms: mappedForms,
        pagination: { total, page, limit, totalPages }
      };
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

      const safeForm = {
        id: form.id,
        title: form.title,
        description: form.description,
        slug: form.slug,
        theme: form.theme,
      };

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

      const unlockToken = jwt.sign({ formId: form.id }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: FORM_UNLOCK_TOKEN_TTL_SECONDS });

      const fields = await db
        .select()
        .from(formFields)
        .where(eq(formFields.formId, form.id))
        .orderBy(formFields.order);

      return { fields, unlockToken };
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
      
      if (form.password) {
        if (!input.unlockToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "This form is password protected. Missing unlock token.",
          });
        }
        try {
          const decoded = jwt.verify(input.unlockToken, process.env.JWT_SECRET || 'default_jwt_secret');
          if (decoded.formId !== input.formId) {
             throw new Error("Token mismatch");
          }
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired unlock token",
          });
        }
      }

      if (form.isTemplate) {
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "This is a read-only template. Clone it to your workspace to accept responses." 
        });
      }
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

      // 🚀 FIX: Prevent Orphaned Submissions using Transaction
      await db.transaction(async (tx) => {
        const [newSubmission] = await tx
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
          await tx.insert(fieldResponses).values(answersToInsert);
        }
      });

      return { message: "Response submitted successfully!" };
    }),
});