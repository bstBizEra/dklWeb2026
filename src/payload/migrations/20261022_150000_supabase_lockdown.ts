import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { lockdownPublicSchema } from '../supabase-lockdown'

// Closes Supabase's Data API for the CMS tables. See ../supabase-lockdown.ts.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await lockdownPublicSchema(db)
}

// Not reversible on purpose: re-opening the Data API to anonymous visitors must be a deliberate act.
export async function down({}: MigrateDownArgs): Promise<void> {}
