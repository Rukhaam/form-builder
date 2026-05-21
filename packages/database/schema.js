import { pgTable, text, timestamp, boolean, uuid, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';

export const visibilityEnum = pgEnum('visibility', ['PUBLIC', 'UNLISTED']);
export const statusEnum = pgEnum('status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const fieldTypeEnum = pgEnum('field_type', ['short_text', 'long_text', 'email', 'number', 'single_select', 'multi_select', 'checkbox']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const forms = pgTable('forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  slug: text('slug').unique().notNull(),
  status: statusEnum('status').default('DRAFT').notNull(),
  visibility: visibilityEnum('visibility').default('PUBLIC').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const formFields = pgTable('form_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  type: fieldTypeEnum('type').notNull(),
  label: text('label').notNull(),
  required: boolean('required').default(false).notNull(),
  order: integer('order').notNull(),
  options: jsonb('options'),
});