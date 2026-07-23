import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
  index,
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
export const authProviderEnum = pgEnum("auth_provider", [
  "LOCAL",
  "GOOGLE",
  "GITHUB",
]);
export const workspaceRoleEnum = pgEnum("workspace_role", [
  "OWNER",
  "ADMIN",
  "EDITOR",
  "VIEWER",
]);

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

// ── Workspaces ──────────────────────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: workspaceRoleEnum("role").default("VIEWER").notNull(),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => {
    return {
      workspaceUserUnique: uniqueIndex("workspace_user_unique").on(
        table.workspaceId,
        table.userId,
      ),
    };
  },
);

export const workspaceInvites = pgTable("workspace_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  role: workspaceRoleEnum("invite_role").default("VIEWER").notNull(),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Forms ───────────────────────────────────────────────────────────────
export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").unique().notNull(),
  status: statusEnum("status").default("DRAFT").notNull(),
  visibility: visibilityEnum("visibility").default("PUBLIC").notNull(),
  password: text("password"),
  theme: text("theme").default("light"),
  isTemplate: boolean("is_template").default(false),
  category: text("category"),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  isExpired: boolean("is_expired").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  maxResponses: integer("max_responses"),
  oneResponsePerPerson: boolean("one_response_per_person")
    .default(false)
    .notNull(),
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

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => forms.id)
    .notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const fieldResponses = pgTable("field_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .references(() => formSubmissions.id, { onDelete: "cascade" })
    .notNull(),
  fieldId: uuid("field_id")
    .references(() => formFields.id, { onDelete: "cascade" })
    .notNull(),
  value: text("value").notNull(),
});

export const formReviews = pgTable("form_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => forms.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, {
    onDelete: "set null",
  }),
  planId: text("plan_id").default("FREE").notNull(),
  status: text("status").default("active").notNull(),

  // Razorpay Specifics
  razorpayCustomerId: text("razorpay_customer_id"),
  razorpaySubscriptionId: text("razorpay_subscription_id").unique(),

  // Billing Cycle
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usageCounters = pgTable(
  "usage_counters",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    metric: text("metric").notNull(), // e.g., 'forms_created', 'responses_collected'
    periodKey: text("period_key").notNull(), // e.g., 'LIFETIME' or '2026-05'
    usedCount: integer("used_count").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      userMetricPeriodUnique: uniqueIndex("user_metric_period_unique").on(
        table.userId,
        table.metric,
        table.periodKey,
      ),
    };
  },
);

export const aiAssistantConversations = pgTable(
  "ai_assistant_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    formId: uuid("form_id").references(() => forms.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userUpdatedAtIndex: index(
      "ai_assistant_conversations_user_updated_at_idx",
    ).on(table.userId, table.updatedAt),
  }),
);

export const aiAssistantMessages = pgTable(
  "ai_assistant_messages",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id")
      .references(() => aiAssistantConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    formId: uuid("form_id").references(() => forms.id, {
      onDelete: "set null",
    }),
    formSnapshot: jsonb("form_snapshot"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationCreatedAtIndex: index(
      "ai_assistant_messages_conversation_created_at_idx",
    ).on(table.conversationId, table.createdAt),
  }),
);

export const aiSummaries = pgTable("ai_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => forms.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  summary: text("summary").notNull(),
  themes: jsonb("themes").notNull(),
  sentiment: jsonb("sentiment").notNull(),
  responsesHash: text("responses_hash").notNull(),
  submissionCount: integer("submission_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .references(() => forms.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  url: text("url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  secret: text("secret"),
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastStatus: integer("last_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
