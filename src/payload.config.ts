import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Articles } from "./payload/collections/articles";
import { LeadPhotos } from "./payload/collections/lead-photos";
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
    meta: {
      titleSuffix: " | DK LAO CMS",
      icons: [{ url: "/images/fav-icon/FAV-Icon.png", type: "image/png" }],
    },
    // BizEra's identity, which the panel wears as its developer: see app/(payload)/custom.scss. Their
    // own site is dark only, so a light admin would be an identity they do not have.
    theme: "dark",
    components: {
      graphics: { Logo: "/payload/admin/logo", Icon: "/payload/admin/icon" },
      afterNavLinks: ["/payload/admin/developed-by"],
    },
  },
  collections: [Users, Pages, Articles, Leads, LeadPhotos],
  globals: [SiteFacts, Navigation],
  editor: lexicalEditor(),
  // English and Lao. Lao pages ask for locale "lo"; a Lao field left empty shows the English text.
  localization: {
    locales: [
      { code: "en", label: "English" },
      { code: "lo", label: "ລາວ" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  // Throws at startup when a production server with a database has no proper secret (lib/payload-secret.ts).
  secret: payloadSecret(),
  graphQL: { disable: true },
  // Password reset and invite emails, over the same SMTP account as lead email (see lib/leads/email.ts).
  ...(emailOptions ? { email: nodemailerAdapter(emailOptions) } : {}),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    // Serverless hosting opens many short-lived connections: keep each instance small (set 1 to 3 on Vercel).
    // connectionTimeoutMillis: a query waits at most this long for a connection instead of forever, so a
    // database outage turns into a quick error the lead pipeline can fall back from.
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 5000),
      idleTimeoutMillis: 30_000,
    },
    push: false, // schema changes go through reviewed migrations only
    migrationDir: path.resolve(dirname, "payload/migrations"),
    // In production the app applies any pending migrations when it starts, with the DATABASE_URL from the
    // host's settings, so nobody types the database password into a terminal. Development runs them by hand.
    prodMigrations: migrations,
  }),
});
