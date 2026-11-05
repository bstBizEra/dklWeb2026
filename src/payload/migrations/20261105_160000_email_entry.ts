import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

import { lockdownPublicSchema } from "../supabase-lockdown";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "cms_email_entry" (
      "email" varchar(254) PRIMARY KEY NOT NULL,
      "code_hash" varchar(64),
      "expires_at" timestamp(3) with time zone NOT NULL,
      "attempts" integer DEFAULT 0 NOT NULL,
      "verified_at" timestamp(3) with time zone,
      "proof_hash" varchar(64),
      "consumed_at" timestamp(3) with time zone
    );
    CREATE INDEX "cms_email_entry_expires_at_idx" ON "cms_email_entry" USING btree ("expires_at");
  `);
  await lockdownPublicSchema(db);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "cms_email_entry";`);
}
