import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

// Shared quote-form rate limit (src/lib/leads/rate-store.ts). One row per client bucket per fixed window,
// counted with an atomic upsert, so every server process sees the same counts. Not a Payload collection:
// it is never edited in the admin, and rows older than two windows are deleted as the form is used.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "lead_rate_limits" (
  	"bucket" varchar(200) NOT NULL,
  	"window_start" timestamp(3) with time zone NOT NULL,
  	"hits" integer NOT NULL DEFAULT 1,
  	CONSTRAINT "lead_rate_limits_pkey" PRIMARY KEY ("bucket", "window_start")
  );

  CREATE INDEX IF NOT EXISTS "lead_rate_limits_window_start_idx" ON "lead_rate_limits" USING btree ("window_start");`)
  await lockdownPublicSchema(db)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "lead_rate_limits";`)
}
