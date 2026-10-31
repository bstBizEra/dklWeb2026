import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Articles } from "./payload/collections/articles";
import { Leads } from "./payload/collections/leads";
import { Pages } from "./payload/collections/pages";
import { Users } from "./payload/collections/users";
import { Navigation } from "./payload/globals/navigation";
import { SiteFacts } from "./payload/globals/site-facts";
import { migrations } from "./payload/migrations";
import { payloadEmailOptions } from "./lib/leads/email";
import { payloadSecret } from "./lib/payload-secret";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const emailOptions = payloadEmailOptions();

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname, importMapFile: path.resolve(dirname, "app/(payload)/admin/importMap.ts") },
    meta: { titleSuffix: " | DK LAO CMS" },
  },
  collections: [Users, Pages, Articles, Leads],
  globals: [SiteFacts, Navigation],
  editor: lexicalEditor(),
  // Throws at startup when a production server with a database has no proper secret (lib/payload-secret.ts).
  secret: payloadSecret(),
  graphQL: { disable: true },
  // Password reset and invite emails, over the same SMTP account as lead email (see lib/leads/email.ts).
  ...(emailOptions ? { email: nodemailerAdapter(emailOptions) } : {}),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    // Serverless hosting opens many short-lived connections: keep each instance small (set 1 to 3 on Vercel).
    pool: { connectionString: process.env.DATABASE_URL, max: Number(process.env.DATABASE_POOL_MAX ?? 10) },
    push: false, // schema changes go through reviewed migrations only
    migrationDir: path.resolve(dirname, "payload/migrations"),
    // In production the app applies any pending migrations when it starts, with the DATABASE_URL from the
    // host's settings, so nobody types the database password into a terminal. Development runs them by hand.
    prodMigrations: migrations,
  }),
});
