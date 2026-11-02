import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

// Staff-only photos attached to leads (src/payload/collections/lead-photos.ts).
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "lead_photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lead_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lead_photos_id" integer;
  ALTER TABLE "lead_photos" ADD CONSTRAINT "lead_photos_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lead_photos_lead_idx" ON "lead_photos" USING btree ("lead_id");
  CREATE INDEX "lead_photos_updated_at_idx" ON "lead_photos" USING btree ("updated_at");
  CREATE INDEX "lead_photos_created_at_idx" ON "lead_photos" USING btree ("created_at");
  CREATE UNIQUE INDEX "lead_photos_filename_idx" ON "lead_photos" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lead_photos_fk" FOREIGN KEY ("lead_photos_id") REFERENCES "public"."lead_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_lead_photos_id_idx" ON "payload_locked_documents_rels" USING btree ("lead_photos_id");`)
  // Customer photos: keep the new table closed to Supabase's public API roles, like every other table.
  await lockdownPublicSchema(db)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lead_photos" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lead_photos" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_lead_photos_fk";

  DROP INDEX IF EXISTS "payload_locked_documents_rels_lead_photos_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "lead_photos_id";`)
}
