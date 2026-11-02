import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_sections_items_fact" AS ENUM('phone', 'whatsapp', 'facebook', 'email', 'address', 'hours', 'serviceAreas', 'quoteReplyTime', 'deliveryCoverage', 'maintenanceTerms', 'rentToBuyTerms', 'brands');
  CREATE TYPE "public"."enum_pages_sections_kind" AS ENUM('cards', 'steps', 'table', 'faq');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_sections_items_fact" AS ENUM('phone', 'whatsapp', 'facebook', 'email', 'address', 'hours', 'serviceAreas', 'quoteReplyTime', 'deliveryCoverage', 'maintenanceTerms', 'rentToBuyTerms', 'brands');
  CREATE TYPE "public"."enum__pages_v_version_sections_kind" AS ENUM('cards', 'steps', 'table', 'faq');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_articles_category" AS ENUM('rental-guide', 'selection-guide', 'parts-guide', 'maintenance-guide', 'warehouse-guide', 'cleaning-guide', 'safety-training');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('rental-guide', 'selection-guide', 'parts-guide', 'maintenance-guide', 'warehouse-guide', 'cleaning-guide', 'safety-training');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "pages_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"route_id" varchar,
  	"fact" "enum_pages_sections_items_fact"
  );
  
  CREATE TABLE "pages_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_sections_kind" DEFAULT 'cards',
  	"title" varchar,
  	"intro" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"route_id" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"eyebrow" varchar,
  	"h1" varchar,
  	"intro" varchar,
  	"closing_title" varchar,
  	"closing_copy" varchar,
  	"closing_primary_label" varchar,
  	"closing_primary_href" varchar,
  	"closing_secondary_label" varchar,
  	"closing_secondary_href" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_version_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"route_id" varchar,
  	"fact" "enum__pages_v_version_sections_items_fact",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_version_sections_kind" DEFAULT 'cards',
  	"title" varchar,
  	"intro" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_route_id" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_eyebrow" varchar,
  	"version_h1" varchar,
  	"version_intro" varchar,
  	"version_closing_title" varchar,
  	"version_closing_copy" varchar,
  	"version_closing_primary_label" varchar,
  	"version_closing_primary_href" varchar,
  	"version_closing_secondary_label" varchar,
  	"version_closing_secondary_href" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "articles_related_route_ids" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"route_id" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_articles_category",
  	"excerpt" varchar,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_articles_v_version_related_route_ids" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"route_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__articles_v_version_category",
  	"version_excerpt" varchar,
  	"version_body" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "articles_id" integer;
  ALTER TABLE "pages_ctas" ADD CONSTRAINT "pages_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items" ADD CONSTRAINT "pages_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections" ADD CONSTRAINT "pages_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_ctas" ADD CONSTRAINT "_pages_v_version_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items" ADD CONSTRAINT "_pages_v_version_sections_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections" ADD CONSTRAINT "_pages_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_related_route_ids" ADD CONSTRAINT "articles_related_route_ids_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_related_route_ids" ADD CONSTRAINT "_articles_v_version_related_route_ids_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_ctas_order_idx" ON "pages_ctas" USING btree ("_order");
  CREATE INDEX "pages_ctas_parent_id_idx" ON "pages_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_items_order_idx" ON "pages_sections_items" USING btree ("_order");
  CREATE INDEX "pages_sections_items_parent_id_idx" ON "pages_sections_items" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_order_idx" ON "pages_sections" USING btree ("_order");
  CREATE INDEX "pages_sections_parent_id_idx" ON "pages_sections" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_route_id_idx" ON "pages" USING btree ("route_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_version_ctas_order_idx" ON "_pages_v_version_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_version_ctas_parent_id_idx" ON "_pages_v_version_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_items_order_idx" ON "_pages_v_version_sections_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_items_parent_id_idx" ON "_pages_v_version_sections_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_order_idx" ON "_pages_v_version_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_parent_id_idx" ON "_pages_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_route_id_idx" ON "_pages_v" USING btree ("version_route_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "articles_related_route_ids_order_idx" ON "articles_related_route_ids" USING btree ("_order");
  CREATE INDEX "articles_related_route_ids_parent_id_idx" ON "articles_related_route_ids" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "_articles_v_version_related_route_ids_order_idx" ON "_articles_v_version_related_route_ids" USING btree ("_order");
  CREATE INDEX "_articles_v_version_related_route_ids_parent_id_idx" ON "_articles_v_version_related_route_ids" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles_related_route_ids" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "articles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_related_route_ids" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_ctas" CASCADE;
  DROP TABLE "pages_sections_items" CASCADE;
  DROP TABLE "pages_sections" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_version_ctas" CASCADE;
  DROP TABLE "_pages_v_version_sections_items" CASCADE;
  DROP TABLE "_pages_v_version_sections" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "articles_related_route_ids" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "_articles_v_version_related_route_ids" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_articles_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_pages_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_articles_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "articles_id";
  DROP TYPE "public"."enum_pages_sections_items_fact";
  DROP TYPE "public"."enum_pages_sections_kind";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_sections_items_fact";
  DROP TYPE "public"."enum__pages_v_version_sections_kind";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_articles_category";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_category";
  DROP TYPE "public"."enum__articles_v_version_status";`)
}
