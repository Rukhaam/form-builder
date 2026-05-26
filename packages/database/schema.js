import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const visibilityEnum = pgEnum("visibility", ["PUBLIC", "UNLISTED"]);
export const statusEnum = pgEnum("status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
]);
export const authProviderEnum = pgEnum('auth_provider', ['LOCAL', 'GOOGLE', 'GITHUB']);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  authProvider: authProviderEnum("auth_provider").default("LOCAL").notNull(),
  providerId: text("provider_id"), // For OAuth users, store the provider's user ID
  otp: text("otp"),
  otpExpiry: timestamp("otp_expiry"),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").unique().notNull(),
  status: statusEnum("status").default("DRAFT").notNull(),
  visibility: visibilityEnum("visibility").default("PUBLIC").notNull(),
  password: text('password'),
  theme: text('theme').default('light'), 
  isTemplate: boolean('is_template').default(false), 
  category: text('category'),
  createdAt: timestamp("created_at").defaultNow(),
  isExpired: boolean("is_expired").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
});

export const formFields = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => forms.id, { onDelete: "cascade" })
    .notNull(),
  type: fieldTypeEnum("type").notNull(),
  label: text("label").notNull(),
  required: boolean("required").default(false).notNull(),
  order: integer("order").notNull(),
  options: jsonb("options"),
});

export const formSubmissions = pgTable('form_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id).notNull(),
  submittedAt: timestamp('submitted_at').defaultNow(),
});

export const fieldResponses = pgTable('field_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').references(() => formSubmissions.id, { onDelete: 'cascade' }).notNull(),
  fieldId: uuid('field_id').references(() => formFields.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(), 
});

export const formReviews = pgTable('form_reviews',{
  id:uuid('id').primaryKey().defaultRandom(),
  formId:uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  planId: text('plan_id').default('FREE').notNull(), 
  status: text('status').default('active').notNull(), 
  
  // Razorpay Specifics
  razorpayCustomerId: text('razorpay_customer_id'),
  razorpaySubscriptionId: text('razorpay_subscription_id').unique(),
  
  // Billing Cycle
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const usageCounters = pgTable('usage_counters', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  metric: text('metric').notNull(), // e.g., 'forms_created', 'responses_collected'
  periodKey: text('period_key').notNull(), // e.g., 'LIFETIME' or '2026-05'
  usedCount: integer('used_count').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
   
    userMetricPeriodUnique: uniqueIndex('user_metric_period_unique').on(table.userId, table.metric, table.periodKey),
  };
});