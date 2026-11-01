import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

// Lao localization (Payload `localization`, locales en and lo). Visible text moves from its table into a
// "<table>_locales" table keyed by locale. Hand-edited: every existing value is copied in as locale "en"
// BEFORE its old column is dropped (the generated migration would drop the text), and down copies "en" back
// before the locale tables are dropped. Lao rows are written later by the seed or the admin.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'lo');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'lo');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('en', 'lo');
  CREATE TABLE "pages_ctas_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections_items_details_facts_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections_items_details_topics_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections_items_details_checklist_locales" (
  	"point" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"details_lead" varchar,
  	"details_checklist_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_sections_locales" (
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"eyebrow" varchar,
  	"h1" varchar,
  	"intro" varchar,
  	"closing_title" varchar,
  	"closing_copy" varchar,
  	"closing_primary_label" varchar,
  	"closing_secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_ctas_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_facts_locales" (
  	"value" varchar,
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_topics_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_checklist_locales" (
  	"point" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_sections_items_locales" (
  	"title" varchar,
  	"description" varchar,
  	"details_lead" varchar,
  	"details_checklist_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_sections_locales" (
  	"title" varchar,
  	"intro" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_eyebrow" varchar,
  	"version_h1" varchar,
  	"version_intro" varchar,
  	"version_closing_title" varchar,
  	"version_closing_copy" varchar,
  	"version_closing_primary_label" varchar,
  	"version_closing_secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_facts_locales" (
  	"address" varchar,
  	"hours" varchar,
  	"service_areas" varchar,
  	"quote_reply_time" varchar,
  	"delivery_coverage" varchar,
  	"maintenance_terms" varchar,
  	"rent_to_buy_terms" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_items_children_locales" (
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "_pages_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "published_locale" "enum__pages_v_published_locale";
  ALTER TABLE "_articles_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_articles_v" ADD COLUMN "published_locale" "enum__articles_v_published_locale";
  ALTER TABLE "pages_ctas_locales" ADD CONSTRAINT "pages_ctas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_ctas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_details_facts_locales" ADD CONSTRAINT "pages_sections_items_details_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items_details_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_details_topics_locales" ADD CONSTRAINT "pages_sections_items_details_topics_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items_details_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_details_checklist_locales" ADD CONSTRAINT "pages_sections_items_details_checklist_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items_details_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_locales" ADD CONSTRAINT "pages_sections_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_locales" ADD CONSTRAINT "pages_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_ctas_locales" ADD CONSTRAINT "_pages_v_version_ctas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_ctas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_facts_locales" ADD CONSTRAINT "_pages_v_version_sections_items_details_facts_locales_par_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items_details_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_topics_locales" ADD CONSTRAINT "_pages_v_version_sections_items_details_topics_locales_pa_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items_details_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_checklist_locales" ADD CONSTRAINT "_pages_v_version_sections_items_details_checklist_locales_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items_details_checklist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_locales" ADD CONSTRAINT "_pages_v_version_sections_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_locales" ADD CONSTRAINT "_pages_v_version_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_facts_locales" ADD CONSTRAINT "site_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_children_locales" ADD CONSTRAINT "navigation_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_ctas_locales_locale_parent_id_unique" ON "pages_ctas_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_sections_items_details_facts_locales_locale_parent_id_" ON "pages_sections_items_details_facts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_sections_items_details_topics_locales_locale_parent_id" ON "pages_sections_items_details_topics_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_sections_items_details_checklist_locales_locale_parent" ON "pages_sections_items_details_checklist_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_sections_items_locales_locale_parent_id_unique" ON "pages_sections_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_sections_locales_locale_parent_id_unique" ON "pages_sections_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_ctas_locales_locale_parent_id_unique" ON "_pages_v_version_ctas_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_sections_items_details_facts_locales_locale" ON "_pages_v_version_sections_items_details_facts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_sections_items_details_topics_locales_local" ON "_pages_v_version_sections_items_details_topics_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_sections_items_details_checklist_locales_lo" ON "_pages_v_version_sections_items_details_checklist_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_sections_items_locales_locale_parent_id_uni" ON "_pages_v_version_sections_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_version_sections_locales_locale_parent_id_unique" ON "_pages_v_version_sections_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "site_facts_locales_locale_parent_id_unique" ON "site_facts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_items_children_locales_locale_parent_id_unique" ON "navigation_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  -- Copy every existing value into the new locale tables as English BEFORE the old columns are dropped.
  INSERT INTO "pages_ctas_locales" ("label", "_locale", "_parent_id") SELECT "label", 'en', "id" FROM "pages_ctas";
  INSERT INTO "pages_sections_items_details_facts_locales" ("value", "label", "_locale", "_parent_id") SELECT "value", "label", 'en', "id" FROM "pages_sections_items_details_facts";
  INSERT INTO "pages_sections_items_details_topics_locales" ("heading", "body", "_locale", "_parent_id") SELECT "heading", "body", 'en', "id" FROM "pages_sections_items_details_topics";
  INSERT INTO "pages_sections_items_details_checklist_locales" ("point", "_locale", "_parent_id") SELECT "point", 'en', "id" FROM "pages_sections_items_details_checklist";
  INSERT INTO "pages_sections_items_locales" ("title", "description", "details_lead", "details_checklist_heading", "_locale", "_parent_id") SELECT "title", "description", "details_lead", "details_checklist_heading", 'en', "id" FROM "pages_sections_items";
  INSERT INTO "pages_sections_locales" ("title", "intro", "body", "_locale", "_parent_id") SELECT "title", "intro", "body", 'en', "id" FROM "pages_sections";
  INSERT INTO "pages_locales" ("meta_title", "meta_description", "eyebrow", "h1", "intro", "closing_title", "closing_copy", "closing_primary_label", "closing_secondary_label", "_locale", "_parent_id") SELECT "meta_title", "meta_description", "eyebrow", "h1", "intro", "closing_title", "closing_copy", "closing_primary_label", "closing_secondary_label", 'en', "id" FROM "pages";
  INSERT INTO "_pages_v_version_ctas_locales" ("label", "_locale", "_parent_id") SELECT "label", 'en', "id" FROM "_pages_v_version_ctas";
  INSERT INTO "_pages_v_version_sections_items_details_facts_locales" ("value", "label", "_locale", "_parent_id") SELECT "value", "label", 'en', "id" FROM "_pages_v_version_sections_items_details_facts";
  INSERT INTO "_pages_v_version_sections_items_details_topics_locales" ("heading", "body", "_locale", "_parent_id") SELECT "heading", "body", 'en', "id" FROM "_pages_v_version_sections_items_details_topics";
  INSERT INTO "_pages_v_version_sections_items_details_checklist_locales" ("point", "_locale", "_parent_id") SELECT "point", 'en', "id" FROM "_pages_v_version_sections_items_details_checklist";
  INSERT INTO "_pages_v_version_sections_items_locales" ("title", "description", "details_lead", "details_checklist_heading", "_locale", "_parent_id") SELECT "title", "description", "details_lead", "details_checklist_heading", 'en', "id" FROM "_pages_v_version_sections_items";
  INSERT INTO "_pages_v_version_sections_locales" ("title", "intro", "body", "_locale", "_parent_id") SELECT "title", "intro", "body", 'en', "id" FROM "_pages_v_version_sections";
  INSERT INTO "_pages_v_locales" ("version_meta_title", "version_meta_description", "version_eyebrow", "version_h1", "version_intro", "version_closing_title", "version_closing_copy", "version_closing_primary_label", "version_closing_secondary_label", "_locale", "_parent_id") SELECT "version_meta_title", "version_meta_description", "version_eyebrow", "version_h1", "version_intro", "version_closing_title", "version_closing_copy", "version_closing_primary_label", "version_closing_secondary_label", 'en', "id" FROM "_pages_v";
  INSERT INTO "articles_locales" ("title", "excerpt", "body", "meta_title", "meta_description", "_locale", "_parent_id") SELECT "title", "excerpt", "body", "meta_title", "meta_description", 'en', "id" FROM "articles";
  INSERT INTO "_articles_v_locales" ("version_title", "version_excerpt", "version_body", "version_meta_title", "version_meta_description", "_locale", "_parent_id") SELECT "version_title", "version_excerpt", "version_body", "version_meta_title", "version_meta_description", 'en', "id" FROM "_articles_v";
  INSERT INTO "site_facts_locales" ("address", "hours", "service_areas", "quote_reply_time", "delivery_coverage", "maintenance_terms", "rent_to_buy_terms", "_locale", "_parent_id") SELECT "address", "hours", "service_areas", "quote_reply_time", "delivery_coverage", "maintenance_terms", "rent_to_buy_terms", 'en', "id" FROM "site_facts";
  INSERT INTO "navigation_items_children_locales" ("label", "description", "_locale", "_parent_id") SELECT "label", "description", 'en', "id" FROM "navigation_items_children";
  INSERT INTO "navigation_items_locales" ("label", "_locale", "_parent_id") SELECT "label", 'en', "id" FROM "navigation_items";
  ALTER TABLE "pages_ctas" DROP COLUMN "label";
  ALTER TABLE "pages_sections_items_details_facts" DROP COLUMN "value";
  ALTER TABLE "pages_sections_items_details_facts" DROP COLUMN "label";
  ALTER TABLE "pages_sections_items_details_topics" DROP COLUMN "heading";
  ALTER TABLE "pages_sections_items_details_topics" DROP COLUMN "body";
  ALTER TABLE "pages_sections_items_details_checklist" DROP COLUMN "point";
  ALTER TABLE "pages_sections_items" DROP COLUMN "title";
  ALTER TABLE "pages_sections_items" DROP COLUMN "description";
  ALTER TABLE "pages_sections_items" DROP COLUMN "details_lead";
  ALTER TABLE "pages_sections_items" DROP COLUMN "details_checklist_heading";
  ALTER TABLE "pages_sections" DROP COLUMN "title";
  ALTER TABLE "pages_sections" DROP COLUMN "intro";
  ALTER TABLE "pages_sections" DROP COLUMN "body";
  ALTER TABLE "pages" DROP COLUMN "meta_title";
  ALTER TABLE "pages" DROP COLUMN "meta_description";
  ALTER TABLE "pages" DROP COLUMN "eyebrow";
  ALTER TABLE "pages" DROP COLUMN "h1";
  ALTER TABLE "pages" DROP COLUMN "intro";
  ALTER TABLE "pages" DROP COLUMN "closing_title";
  ALTER TABLE "pages" DROP COLUMN "closing_copy";
  ALTER TABLE "pages" DROP COLUMN "closing_primary_label";
  ALTER TABLE "pages" DROP COLUMN "closing_secondary_label";
  ALTER TABLE "_pages_v_version_ctas" DROP COLUMN "label";
  ALTER TABLE "_pages_v_version_sections_items_details_facts" DROP COLUMN "value";
  ALTER TABLE "_pages_v_version_sections_items_details_facts" DROP COLUMN "label";
  ALTER TABLE "_pages_v_version_sections_items_details_topics" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_version_sections_items_details_topics" DROP COLUMN "body";
  ALTER TABLE "_pages_v_version_sections_items_details_checklist" DROP COLUMN "point";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "title";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "description";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "details_lead";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "details_checklist_heading";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "title";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "body";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_eyebrow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_h1";
  ALTER TABLE "_pages_v" DROP COLUMN "version_intro";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_copy";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_primary_label";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_secondary_label";
  ALTER TABLE "articles" DROP COLUMN "title";
  ALTER TABLE "articles" DROP COLUMN "excerpt";
  ALTER TABLE "articles" DROP COLUMN "body";
  ALTER TABLE "articles" DROP COLUMN "meta_title";
  ALTER TABLE "articles" DROP COLUMN "meta_description";
  ALTER TABLE "_articles_v" DROP COLUMN "version_title";
  ALTER TABLE "_articles_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_articles_v" DROP COLUMN "version_body";
  ALTER TABLE "_articles_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_articles_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "site_facts" DROP COLUMN "address";
  ALTER TABLE "site_facts" DROP COLUMN "hours";
  ALTER TABLE "site_facts" DROP COLUMN "service_areas";
  ALTER TABLE "site_facts" DROP COLUMN "quote_reply_time";
  ALTER TABLE "site_facts" DROP COLUMN "delivery_coverage";
  ALTER TABLE "site_facts" DROP COLUMN "maintenance_terms";
  ALTER TABLE "site_facts" DROP COLUMN "rent_to_buy_terms";
  ALTER TABLE "navigation_items_children" DROP COLUMN "label";
  ALTER TABLE "navigation_items_children" DROP COLUMN "description";
  ALTER TABLE "navigation_items" DROP COLUMN "label";`)
  // New tables: close Supabase's Data API for them too.
  await lockdownPublicSchema(db)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_ctas" ADD COLUMN "label" varchar;
  ALTER TABLE "pages_sections_items_details_facts" ADD COLUMN "value" varchar;
  ALTER TABLE "pages_sections_items_details_facts" ADD COLUMN "label" varchar;
  ALTER TABLE "pages_sections_items_details_topics" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_sections_items_details_topics" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_sections_items_details_checklist" ADD COLUMN "point" varchar;
  ALTER TABLE "pages_sections_items" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_sections_items" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_sections_items" ADD COLUMN "details_lead" varchar;
  ALTER TABLE "pages_sections_items" ADD COLUMN "details_checklist_heading" varchar;
  ALTER TABLE "pages_sections" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_sections" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_sections" ADD COLUMN "body" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages" ADD COLUMN "h1" varchar;
  ALTER TABLE "pages" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_copy" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_primary_label" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_secondary_label" varchar;
  ALTER TABLE "_pages_v_version_ctas" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_version_sections_items_details_facts" ADD COLUMN "value" varchar;
  ALTER TABLE "_pages_v_version_sections_items_details_facts" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_version_sections_items_details_topics" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_version_sections_items_details_topics" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_version_sections_items_details_checklist" ADD COLUMN "point" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "details_lead" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "details_checklist_heading" varchar;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_eyebrow" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_h1" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_intro" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_copy" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_primary_label" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_secondary_label" varchar;
  ALTER TABLE "articles" ADD COLUMN "title" varchar;
  ALTER TABLE "articles" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "articles" ADD COLUMN "body" jsonb;
  ALTER TABLE "articles" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "articles" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_body" jsonb;
  ALTER TABLE "_articles_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "address" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "hours" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "service_areas" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "quote_reply_time" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "delivery_coverage" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "maintenance_terms" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "rent_to_buy_terms" varchar;
  ALTER TABLE "navigation_items_children" ADD COLUMN "label" varchar;
  ALTER TABLE "navigation_items_children" ADD COLUMN "description" varchar;
  ALTER TABLE "navigation_items" ADD COLUMN "label" varchar;
  -- Copy the English values back before the locale tables are dropped (Lao text is dropped with them).
  UPDATE "pages_ctas" SET "label" = l."label" FROM "pages_ctas_locales" l WHERE l."_parent_id" = "pages_ctas"."id" AND l."_locale" = 'en';
  UPDATE "pages_sections_items_details_facts" SET "value" = l."value", "label" = l."label" FROM "pages_sections_items_details_facts_locales" l WHERE l."_parent_id" = "pages_sections_items_details_facts"."id" AND l."_locale" = 'en';
  UPDATE "pages_sections_items_details_topics" SET "heading" = l."heading", "body" = l."body" FROM "pages_sections_items_details_topics_locales" l WHERE l."_parent_id" = "pages_sections_items_details_topics"."id" AND l."_locale" = 'en';
  UPDATE "pages_sections_items_details_checklist" SET "point" = l."point" FROM "pages_sections_items_details_checklist_locales" l WHERE l."_parent_id" = "pages_sections_items_details_checklist"."id" AND l."_locale" = 'en';
  UPDATE "pages_sections_items" SET "title" = l."title", "description" = l."description", "details_lead" = l."details_lead", "details_checklist_heading" = l."details_checklist_heading" FROM "pages_sections_items_locales" l WHERE l."_parent_id" = "pages_sections_items"."id" AND l."_locale" = 'en';
  UPDATE "pages_sections" SET "title" = l."title", "intro" = l."intro", "body" = l."body" FROM "pages_sections_locales" l WHERE l."_parent_id" = "pages_sections"."id" AND l."_locale" = 'en';
  UPDATE "pages" SET "meta_title" = l."meta_title", "meta_description" = l."meta_description", "eyebrow" = l."eyebrow", "h1" = l."h1", "intro" = l."intro", "closing_title" = l."closing_title", "closing_copy" = l."closing_copy", "closing_primary_label" = l."closing_primary_label", "closing_secondary_label" = l."closing_secondary_label" FROM "pages_locales" l WHERE l."_parent_id" = "pages"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_ctas" SET "label" = l."label" FROM "_pages_v_version_ctas_locales" l WHERE l."_parent_id" = "_pages_v_version_ctas"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_sections_items_details_facts" SET "value" = l."value", "label" = l."label" FROM "_pages_v_version_sections_items_details_facts_locales" l WHERE l."_parent_id" = "_pages_v_version_sections_items_details_facts"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_sections_items_details_topics" SET "heading" = l."heading", "body" = l."body" FROM "_pages_v_version_sections_items_details_topics_locales" l WHERE l."_parent_id" = "_pages_v_version_sections_items_details_topics"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_sections_items_details_checklist" SET "point" = l."point" FROM "_pages_v_version_sections_items_details_checklist_locales" l WHERE l."_parent_id" = "_pages_v_version_sections_items_details_checklist"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_sections_items" SET "title" = l."title", "description" = l."description", "details_lead" = l."details_lead", "details_checklist_heading" = l."details_checklist_heading" FROM "_pages_v_version_sections_items_locales" l WHERE l."_parent_id" = "_pages_v_version_sections_items"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v_version_sections" SET "title" = l."title", "intro" = l."intro", "body" = l."body" FROM "_pages_v_version_sections_locales" l WHERE l."_parent_id" = "_pages_v_version_sections"."id" AND l."_locale" = 'en';
  UPDATE "_pages_v" SET "version_meta_title" = l."version_meta_title", "version_meta_description" = l."version_meta_description", "version_eyebrow" = l."version_eyebrow", "version_h1" = l."version_h1", "version_intro" = l."version_intro", "version_closing_title" = l."version_closing_title", "version_closing_copy" = l."version_closing_copy", "version_closing_primary_label" = l."version_closing_primary_label", "version_closing_secondary_label" = l."version_closing_secondary_label" FROM "_pages_v_locales" l WHERE l."_parent_id" = "_pages_v"."id" AND l."_locale" = 'en';
  UPDATE "articles" SET "title" = l."title", "excerpt" = l."excerpt", "body" = l."body", "meta_title" = l."meta_title", "meta_description" = l."meta_description" FROM "articles_locales" l WHERE l."_parent_id" = "articles"."id" AND l."_locale" = 'en';
  UPDATE "_articles_v" SET "version_title" = l."version_title", "version_excerpt" = l."version_excerpt", "version_body" = l."version_body", "version_meta_title" = l."version_meta_title", "version_meta_description" = l."version_meta_description" FROM "_articles_v_locales" l WHERE l."_parent_id" = "_articles_v"."id" AND l."_locale" = 'en';
  UPDATE "site_facts" SET "address" = l."address", "hours" = l."hours", "service_areas" = l."service_areas", "quote_reply_time" = l."quote_reply_time", "delivery_coverage" = l."delivery_coverage", "maintenance_terms" = l."maintenance_terms", "rent_to_buy_terms" = l."rent_to_buy_terms" FROM "site_facts_locales" l WHERE l."_parent_id" = "site_facts"."id" AND l."_locale" = 'en';
  UPDATE "navigation_items_children" SET "label" = l."label", "description" = l."description" FROM "navigation_items_children_locales" l WHERE l."_parent_id" = "navigation_items_children"."id" AND l."_locale" = 'en';
  UPDATE "navigation_items" SET "label" = l."label" FROM "navigation_items_locales" l WHERE l."_parent_id" = "navigation_items"."id" AND l."_locale" = 'en';
  ALTER TABLE "navigation_items_children" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "navigation_items" ALTER COLUMN "label" SET NOT NULL;
   ALTER TABLE "pages_ctas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_items_details_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_items_details_topics_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_items_details_checklist_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_ctas_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_items_details_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_items_details_topics_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_items_details_checklist_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_items_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_ctas_locales" CASCADE;
  DROP TABLE "pages_sections_items_details_facts_locales" CASCADE;
  DROP TABLE "pages_sections_items_details_topics_locales" CASCADE;
  DROP TABLE "pages_sections_items_details_checklist_locales" CASCADE;
  DROP TABLE "pages_sections_items_locales" CASCADE;
  DROP TABLE "pages_sections_locales" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_version_ctas_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_facts_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_topics_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_checklist_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_locales" CASCADE;
  DROP TABLE "_pages_v_version_sections_locales" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP TABLE "site_facts_locales" CASCADE;
  DROP TABLE "navigation_items_children_locales" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP INDEX "_pages_v_snapshot_idx";
  DROP INDEX "_pages_v_published_locale_idx";
  DROP INDEX "_articles_v_snapshot_idx";
  DROP INDEX "_articles_v_published_locale_idx";
  ALTER TABLE "_pages_v" DROP COLUMN "snapshot";
  ALTER TABLE "_pages_v" DROP COLUMN "published_locale";
  ALTER TABLE "_articles_v" DROP COLUMN "snapshot";
  ALTER TABLE "_articles_v" DROP COLUMN "published_locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum__articles_v_published_locale";`)
}
