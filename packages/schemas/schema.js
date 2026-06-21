import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(16, "Password cannot be longer than 16 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character",
    ),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
// --- Form Management Schemas ---

export const createFormSchema = z.object({
  title: z
    .string()
    .min(1, "Form title is required")
    .max(100, "Title is too long"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug cannot exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  theme: z.string().optional().default("default"),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).optional().default("PUBLIC"),
  isExpired: z.boolean().optional().default(false),
  expiresAt: z.date().optional(),
});

// --- Form Field Schemas ---

export const formFieldSchema = z.object({
  type: z.enum([
    "short_text",
    "long_text",
    "email",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
  ]),
  label: z.string().min(1, "Field label is required"),
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  options: z.array(z.string()).optional(),
});

export const addFieldSchema = formFieldSchema.extend({
  formId: z.string().uuid("Invalid Form ID"),
});

export const saveEditorFormSchema = z.object({
  formId: z.string().uuid("Invalid Form ID").optional(),
  title: z
    .string()
    .min(1, "Form title is required")
    .max(100, "Title is too long"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  visibility: z.enum(["PUBLIC", "UNLISTED"]).default("PUBLIC"),
  password: z.string().nullable().optional(),
 theme: z.string().default("light").optional(),
  isTemplate: z.boolean().default(false).optional(),
  category: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  isExpired: z.boolean().optional().default(false),
  expiresAt: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  maxResponses: z.number().int().min(1, "Must be at least 1").nullable().optional(),
  fields: z.array(
    formFieldSchema.extend({
      id: z.string().uuid("Invalid field ID").optional(),
      options: z.array(z.string()).nullable().optional(),
    }),
  ),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("please enter a valid email address"),
    otp: z.string().length(6, "OTP must be exactly 6 digits"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(16, "Password cannot be longer than 16 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters long")
      .max(16, "Confirm Password cannot be longer than 16 characters")
      .regex(
        /[A-Z]/,
        "Confirm Password must contain at least one uppercase letter",
      )
      .regex(
        /[^a-zA-Z0-9]/,
        "Confirm Password must contain at least one special character",
      ),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export const submitFormSchema = z.object({
  formId: z.string().uuid("Invalid Form ID"),
  unlockToken: z.string().min(1).optional(),
  answers: z.record(z.string().uuid(), z.any()), 
});


export const submitReviewSchema = z.object({
  formId: z.string().uuid("Invalid Form ID"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5").int(),
});

// --- Webhooks Schemas ---

export const upsertWebhookSchema = z.object({
  formId: z.string().uuid("Invalid Form ID"),
  url: z.string().url("Must be a valid URL").refine(
    (url) => url.startsWith('https://'),
    { message: 'Webhook URL must use HTTPS' }
  ),
  secret: z.string().max(128, "Secret cannot exceed 128 characters").optional().nullable(),
  isActive: z.boolean().default(true),
});

export const deleteWebhookSchema = z.object({
  formId: z.string().uuid("Invalid Form ID"),
});

export const testWebhookSchema = z.object({
  formId: z.string().uuid("Invalid Form ID"),
});
