import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_sections_items_fact" ADD VALUE 'youtube' BEFORE 'email';
  ALTER TYPE "public"."enum_pages_sections_items_fact" ADD VALUE 'twitter' BEFORE 'email';
  ALTER TYPE "public"."enum__pages_v_version_sections_items_fact" ADD VALUE 'youtube' BEFORE 'email';
  ALTER TYPE "public"."enum__pages_v_version_sections_items_fact" ADD VALUE 'twitter' BEFORE 'email';
  ALTER TABLE "site_facts" ADD COLUMN "youtube" varchar;
  ALTER TABLE "site_facts" ADD COLUMN "twitter" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_sections_items" ALTER COLUMN "fact" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_sections_items_fact";
  CREATE TYPE "public"."enum_pages_sections_items_fact" AS ENUM('phone', 'whatsapp', 'facebook', 'email', 'address', 'hours', 'serviceAreas', 'quoteReplyTime', 'deliveryCoverage', 'maintenanceTerms', 'rentToBuyTerms', 'brands');
  ALTER TABLE "pages_sections_items" ALTER COLUMN "fact" SET DATA TYPE "public"."enum_pages_sections_items_fact" USING "fact"::"public"."enum_pages_sections_items_fact";
  ALTER TABLE "_pages_v_version_sections_items" ALTER COLUMN "fact" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_version_sections_items_fact";
  CREATE TYPE "public"."enum__pages_v_version_sections_items_fact" AS ENUM('phone', 'whatsapp', 'facebook', 'email', 'address', 'hours', 'serviceAreas', 'quoteReplyTime', 'deliveryCoverage', 'maintenanceTerms', 'rentToBuyTerms', 'brands');
  ALTER TABLE "_pages_v_version_sections_items" ALTER COLUMN "fact" SET DATA TYPE "public"."enum__pages_v_version_sections_items_fact" USING "fact"::"public"."enum__pages_v_version_sections_items_fact";
  ALTER TABLE "site_facts" DROP COLUMN "youtube";
  ALTER TABLE "site_facts" DROP COLUMN "twitter";`)
}
