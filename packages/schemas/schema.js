import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const visibilityEnum = pgEnum('visibility', ['PUBLIC', 'UNLISTED']);
export const statusEnum = pgEnum('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const fieldTypeEnum = pgEnum('field_type', [
  'short_text', 
  'long_text', 
  'email', 
  'number', 
  'single_select', 
  'multi_select', 
  'checkbox'
]);

// Users Table (Supports Custom Auth + OAuth2.0)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for OAuth-only users
  oauthProvider: text('oauth_provider'), // e.g., 'google', 'github'
  oauthId: text('oauth_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Forms Table
export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  theme: text('theme').default('default'),
  status: statusEnum('status').default('DRAFT').notNull(),
  visibility: visibilityEnum('visibility').default('PUBLIC').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Form Fields Table
export const formFields = pgTable('form_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  type: fieldTypeEnum('type').notNull(),
  label: text('label').notNull(),
  required: boolean('required').default(false).notNull(),
  order: integer('order').notNull(),
  options: jsonb('options'), // Stores array of strings for select/multi-select
});

// Responses Table
export const responses = pgTable('responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  respondentIp: text('respondent_ip'), // Used for rate-limiting
  createdAt: timestamp('created_at').defaultNow(),
});

// Response Answers Table
export const responseAnswers = pgTable('response_answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  responseId: uuid('response_id').references(() => responses.id, { onDelete: 'cascade' }).notNull(),
  fieldId: uuid('field_id').references(() => formFields.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(), // All answers stored as text/JSON strings
});