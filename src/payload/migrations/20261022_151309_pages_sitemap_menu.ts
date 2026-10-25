import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_sections_kind" ADD VALUE 'list';
  ALTER TYPE "public"."enum_pages_sections_kind" ADD VALUE 'stats';
  ALTER TYPE "public"."enum_pages_sections_kind" ADD VALUE 'chips';
  ALTER TYPE "public"."enum_pages_sections_kind" ADD VALUE 'text';
  ALTER TYPE "public"."enum_pages_sections_kind" ADD VALUE 'form';
  ALTER TYPE "public"."enum__pages_v_version_sections_kind" ADD VALUE 'list';
  ALTER TYPE "public"."enum__pages_v_version_sections_kind" ADD VALUE 'stats';
  ALTER TYPE "public"."enum__pages_v_version_sections_kind" ADD VALUE 'chips';
  ALTER TYPE "public"."enum__pages_v_version_sections_kind" ADD VALUE 'text';
  ALTER TYPE "public"."enum__pages_v_version_sections_kind" ADD VALUE 'form';
  CREATE TABLE "navigation_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"route_id" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"route_id" varchar
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_sections_items" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "pages_sections" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_sections" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_version_sections" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "articles" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "_articles_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "navigation_items_children" ADD CONSTRAINT "navigation_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "navigation_items_children_order_idx" ON "navigation_items_children" USING btree ("_order");
  CREATE INDEX "navigation_items_children_parent_id_idx" ON "navigation_items_children" USING btree ("_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");`)

  // New tables must be closed to the Supabase Data API too.
  await lockdownPublicSchema(db)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "navigation_items_children" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation" CASCADE;
  ALTER TABLE "pages_sections" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "pages_sections" ALTER COLUMN "kind" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum_pages_sections_kind";
  CREATE TYPE "public"."enum_pages_sections_kind" AS ENUM('cards', 'steps', 'table', 'faq');
  ALTER TABLE "pages_sections" ALTER COLUMN "kind" SET DEFAULT 'cards'::"public"."enum_pages_sections_kind";
  ALTER TABLE "pages_sections" ALTER COLUMN "kind" SET DATA TYPE "public"."enum_pages_sections_kind" USING "kind"::"public"."enum_pages_sections_kind";
  ALTER TABLE "_pages_v_version_sections" ALTER COLUMN "kind" SET DATA TYPE text;
  ALTER TABLE "_pages_v_version_sections" ALTER COLUMN "kind" SET DEFAULT 'cards'::text;
  DROP TYPE "public"."enum__pages_v_version_sections_kind";
  CREATE TYPE "public"."enum__pages_v_version_sections_kind" AS ENUM('cards', 'steps', 'table', 'faq');
  ALTER TABLE "_pages_v_version_sections" ALTER COLUMN "kind" SET DEFAULT 'cards'::"public"."enum__pages_v_version_sections_kind";
  ALTER TABLE "_pages_v_version_sections" ALTER COLUMN "kind" SET DATA TYPE "public"."enum__pages_v_version_sections_kind" USING "kind"::"public"."enum__pages_v_version_sections_kind";
  ALTER TABLE "pages_sections_items" DROP COLUMN "needs_confirmation";
  ALTER TABLE "pages_sections" DROP COLUMN "body";
  ALTER TABLE "pages_sections" DROP COLUMN "needs_confirmation";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "needs_confirmation";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "body";
  ALTER TABLE "_pages_v_version_sections" DROP COLUMN "needs_confirmation";
  ALTER TABLE "articles" DROP COLUMN "generate_slug";
  ALTER TABLE "_articles_v" DROP COLUMN "version_generate_slug";`)
}
