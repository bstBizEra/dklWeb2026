import { sql } from "@payloadcms/db-postgres";
import type { MigrateUpArgs } from "@payloadcms/db-postgres";

// Supabase exposes the "public" schema through its Data API to the anon and authenticated roles.
// The CMS connects as the table owner and does not use that API, so close it: no privileges for
// those roles, and row level security on every table with no policies. Safe to run again: call it
// at the end of every migration that adds tables. On a database without those roles it does nothing.
export async function lockdownPublicSchema(db: MigrateUpArgs["db"]): Promise<void> {
  await db.execute(sql`
    DO $lockdown$
    DECLARE
      t record;
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
         AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        EXECUTE 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated';
        EXECUTE 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated';
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated';
        EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated';
        FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
          EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
        END LOOP;
      END IF;
    END
    $lockdown$;
  `);
}
