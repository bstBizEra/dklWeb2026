# CMS backend decision for DK LAO Website 2026

Status: recommendation for owner approval. Nothing here is built yet.
Source: Claude (Engineer and Business Researcher), 2026-10-22. Sources are listed at the end.

## 1. Question

Do we need an open-source CMS as the backend? Should we clone the WordPress admin to TypeScript?
Should we proceed with local development, GitHub, Vercel and Supabase?

## 2. Short answer

1. **Yes, use an open-source CMS. Do not write a WordPress clone.** Adopt Payload CMS (MIT licence, TypeScript, runs inside our Next.js app).
2. **Yes to the stack**: local first, GitHub for source and CI, Vercel for the site, Supabase for the Postgres database and file storage. Two plan limits matter (section 6).
3. The WordPress admin is copied as a **feature checklist**, not as code. Payload already provides most of it.

## 3. Why not clone WordPress to TypeScript

- WordPress is PHP under GPL. A line-by-line port is a derivative work, years of effort, and we would then own every bug and security patch.
- The REA reverse-engineering skill is for shipped binaries and packages. WordPress source is public, so normal repository reading is the right tool and REA is not needed.
- What the team actually needs from WordPress is a short list of behaviours (section 4). All are standard in Payload.

## 4. WordPress admin features and where they come from

| WordPress admin feature | DK LAO need | In Payload | Work for us |
|---|---|---|---|
| Pages and Posts, drafts, scheduled publish | 21 page specs, knowledge articles | Collections, drafts, scheduled publish | Model `Page`, `Article` from the sitemap data |
| Revisions and restore | Safe edits by non-developers | Versions | Enable |
| Media library | Real photos (fleet, workshop, team) | Uploads with image sizes | Use Supabase Storage (S3) |
| Users and roles | Owner, editor, advisor | Auth and access control per collection | Define 3 roles |
| Menus and widgets | Header, footer, related-solutions block | Globals | `Navigation`, `Footer` globals fed by the route registry |
| Site settings | Fact sheet (years, areas, hours, brands) | Globals | `SiteFacts` global replaces `site-facts.ts` |
| Forms and entries | Quote and contact leads | Collections plus our existing API | Move `local-store` leads to a `Lead` collection |
| SEO plugin (title, meta, schema) | Title and meta rules, JSON-LD | SEO plugin | Keep our length rules |
| Multilingual (WPML) | English now, Lao next | Built-in localisation | Enable `en` and `lo` |
| Live preview | See change before publish | Live Preview | Enable |
| Search, redirects | Later | Plugins | Phase 3 |

Not needed: themes, WordPress plugins marketplace, comments, PHP hosting.

## 5. Options compared

| Option | Licence | Fit with our stack | Verdict |
|---|---|---|---|
| **Payload 3** | MIT | Runs inside the Next.js app. Postgres adapter, works with a Supabase connection string, localisation, versions, access control | **Recommended** |
| Strapi | MIT, some features paid | Separate Node service, more to host | Second choice |
| Directus | BSL 1.1 (free under USD 5M revenue) | Wraps an existing database; separate service | Only if we already had a database |
| Sanity | Proprietary SaaS | Good, but costs grow with seats and usage, and content is not ours to host | Not for this budget |
| WordPress as headless backend | GPL | PHP hosting plus a second codebase | Not chosen |

Trade-off to accept: Payload needs developer time up front. We do not get a ready-made editor experience, we build it.
Fact to watch: Payload was acquired by Figma in June 2025 and stayed MIT.

## 6. Local, GitHub, Vercel, Supabase

| Piece | Role | Decision | Watch out |
|---|---|---|---|
| Local (Laragon, pnpm) | Build and test | Yes, with a local Postgres or a free Supabase dev project | Port 3000 per AGENTS.md |
| GitHub `bstBizEra/dklWeb2026` | Source, CI (test, lint, typecheck, build), preview branches | Yes, already set up | `main` stays protected |
| Vercel | Hosting, preview deployments | Yes, **Pro plan for production**: Hobby is non-commercial only | A company website is commercial |
| Supabase | Postgres and file storage | Yes, **Pro plan (USD 25 a month) for production**: Free projects pause after one week of inactivity | Pick the Singapore region, closest to Laos |

Rough monthly cost for production: Vercel Pro USD 20 per seat plus usage, Supabase Pro USD 25. Prices are from the vendors' pages on 2026-10-22; check before buying.

Open questions for the owner: who pays and owns the Vercel and Supabase accounts, and which email owns them.

## 7. Plan

| Phase | Goal | Done when |
|---|---|---|
| 0. Decide | Owner approves this document and the account owners | Written approval |
| 1. Foundation | Add Payload to the Next.js app, Postgres, 3 roles, `SiteFacts` global, `Lead` collection | Admin login works locally, leads saved, tests pass |
| 2. Content | Model pages and articles from the sitemap, `en` first, hidden `[CONFIRM]` sections stay hidden | The five built pages render from the CMS, with no visual change |
| 3. Deploy | GitHub CI, Vercel preview and production, Supabase Pro, storage for media | Preview URL shows the CMS content |
| 4. Lao and growth | Lao fields, translation review, redirects, search | Owner reviews Lao on staging |

Every phase follows the repo rules: task-prefixed commits, changelog, version bump, `pnpm test`, `lint`, `typecheck`, `build`.

## 8. Risks

- Upfront build cost (Payload gives a framework, not a finished editor).
- Serverless limits on Vercel for large uploads: send media straight to storage.
- Data exposure: leads hold customer names and phones. Keep them behind admin roles, and set retention.
- Lao text quality still needs a native reviewer.
- Free tiers will not keep a live site safe (pause and licence limits).

## 9. Sources

- Payload with Supabase guide and Postgres adapter docs: payloadcms.com/docs/database/postgres
- Comparison and licences: focusreactive.com/choosing-a-headless-cms, naturaily.com/blog/best-headless-cms-you-may-not-have-heard-of
- Vercel Hobby restriction: vercel.com/docs/plans/hobby
- Supabase pricing and pausing: supabase.com/pricing
