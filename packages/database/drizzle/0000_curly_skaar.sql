CREATE TYPE "public"."auth_provider" AS ENUM('LOCAL', 'GOOGLE', 'GITHUB');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'single_select', 'multi_select', 'checkbox');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('PUBLIC', 'UNLISTED');--> statement-breakpoint
CREATE TABLE "field_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" "field_type" NOT NULL,
	"label" text NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "form_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"status" "status" DEFAULT 'DRAFT' NOT NULL,
	"visibility" "visibility" DEFAULT 'PUBLIC' NOT NULL,
	"password" text,
	"theme" text DEFAULT 'light',
	"is_template" boolean DEFAULT false,
	"category" text,
	"created_at" timestamp DEFAULT now(),
	"is_expired" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"max_responses" integer,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"auth_provider" "auth_provider" DEFAULT 'LOCAL' NOT NULL,
	"provider_id" text,
	"otp" text,
	"otp_expiry" timestamp,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "field_responses" ADD CONSTRAINT "field_responses_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_responses" ADD CONSTRAINT "field_responses_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_reviews" ADD CONSTRAINT "form_reviews_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_reviews" ADD CONSTRAINT "form_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;