import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Articles } from "./payload/collections/articles";
import { Leads } from "./payload/collections/leads";
import { Pages } from "./payload/collections/pages";
import { Users } from "./payload/collections/users";
import { SiteFacts } from "./payload/globals/site-facts";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname, importMapFile: path.resolve(dirname, "app/(payload)/admin/importMap.ts") },
    meta: { titleSuffix: " | DK LAO CMS" },
  },
  collections: [Users, Pages, Articles, Leads],
  globals: [SiteFacts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    // Serverless hosting opens many short-lived connections: keep each instance small (set 1 to 3 on Vercel).
    pool: { connectionString: process.env.DATABASE_URL, max: Number(process.env.DATABASE_POOL_MAX ?? 10) },
    push: false, // schema changes go through reviewed migrations only
    migrationDir: path.resolve(dirname, "payload/migrations"),
  }),
});
