import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

import { lockdownPublicSchema } from "../supabase-lockdown";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "admin_allowlist" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "admin_allowlist_email_idx" ON "admin_allowlist" USING btree ("email");
    CREATE INDEX "admin_allowlist_updated_at_idx" ON "admin_allowlist" USING btree ("updated_at");
    CREATE INDEX "admin_allowlist_created_at_idx" ON "admin_allowlist" USING btree ("created_at");
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "admin_allowlist_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_allowlist_fk" FOREIGN KEY ("admin_allowlist_id") REFERENCES "public"."admin_allowlist"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_admin_allowlist_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_allowlist_id");
    DELETE FROM "users_sessions" WHERE "_parent_id" NOT IN (SELECT "id" FROM "users" WHERE "role" = 'owner');
  `);
  await lockdownPublicSchema(db);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_admin_allowlist_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_admin_allowlist_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "admin_allowlist_id";
    DROP TABLE IF EXISTS "admin_allowlist";
  `);
}
