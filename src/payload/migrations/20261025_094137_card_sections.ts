import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_sections_items_details_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_sections_items_details_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_sections_items_details_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_sections_items_details_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"point" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_sections_items" ADD COLUMN "details_lead" varchar;
  ALTER TABLE "pages_sections_items" ADD COLUMN "details_checklist_heading" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "details_lead" varchar;
  ALTER TABLE "_pages_v_version_sections_items" ADD COLUMN "details_checklist_heading" varchar;
  ALTER TABLE "pages_sections_items_details_facts" ADD CONSTRAINT "pages_sections_items_details_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_details_topics" ADD CONSTRAINT "pages_sections_items_details_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_sections_items_details_checklist" ADD CONSTRAINT "pages_sections_items_details_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_facts" ADD CONSTRAINT "_pages_v_version_sections_items_details_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_topics" ADD CONSTRAINT "_pages_v_version_sections_items_details_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_sections_items_details_checklist" ADD CONSTRAINT "_pages_v_version_sections_items_details_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_version_sections_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_sections_items_details_facts_order_idx" ON "pages_sections_items_details_facts" USING btree ("_order");
  CREATE INDEX "pages_sections_items_details_facts_parent_id_idx" ON "pages_sections_items_details_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_items_details_topics_order_idx" ON "pages_sections_items_details_topics" USING btree ("_order");
  CREATE INDEX "pages_sections_items_details_topics_parent_id_idx" ON "pages_sections_items_details_topics" USING btree ("_parent_id");
  CREATE INDEX "pages_sections_items_details_checklist_order_idx" ON "pages_sections_items_details_checklist" USING btree ("_order");
  CREATE INDEX "pages_sections_items_details_checklist_parent_id_idx" ON "pages_sections_items_details_checklist" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_items_details_facts_order_idx" ON "_pages_v_version_sections_items_details_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_items_details_facts_parent_id_idx" ON "_pages_v_version_sections_items_details_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_items_details_topics_order_idx" ON "_pages_v_version_sections_items_details_topics" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_items_details_topics_parent_id_idx" ON "_pages_v_version_sections_items_details_topics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_sections_items_details_checklist_order_idx" ON "_pages_v_version_sections_items_details_checklist" USING btree ("_order");
  CREATE INDEX "_pages_v_version_sections_items_details_checklist_parent_id_idx" ON "_pages_v_version_sections_items_details_checklist" USING btree ("_parent_id");`)

  // New tables: close Supabase's Data API for them too (see ../supabase-lockdown.ts).
  await lockdownPublicSchema(db)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_sections_items_details_facts" CASCADE;
  DROP TABLE "pages_sections_items_details_topics" CASCADE;
  DROP TABLE "pages_sections_items_details_checklist" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_facts" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_topics" CASCADE;
  DROP TABLE "_pages_v_version_sections_items_details_checklist" CASCADE;
  ALTER TABLE "pages_sections_items" DROP COLUMN "details_lead";
  ALTER TABLE "pages_sections_items" DROP COLUMN "details_checklist_heading";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "details_lead";
  ALTER TABLE "_pages_v_version_sections_items" DROP COLUMN "details_checklist_heading";`)
}
