# dklAgent production build

## Source and boundary

Build the staff product inside the cloned `bstBizEra/dklWeb2026` application, starting from `29057c6435f65c3f8448532c094f9604542b43d8`. Preserve `/`, `/about`, and the public quote API envelope. The six primary specifications under `docs/dkl-agent` define behavior; `09-Work-Packages.md` defines dependency order.

## Architecture

- Use the existing Next.js, TypeScript, Zod, and pnpm stack.
- Use Supabase Auth and Postgres with row-level security for staff identity and business data. Server routes recheck active membership and capability before mutation. A service credential is limited to public intake and never reaches the browser.
- Keep the public website available. Replace local JSONL as the authoritative sink only when a database is configured and the migration and retry checks pass.
- Deliver staff workflows as small vertical slices: identity, lead intake, CRM, tasks and tickets, verified knowledge, quote approval, then reporting and deployment evidence.
- AI actions remain reviewable proposals. A provider is enabled only after source, data-use, Lao-language, and safety evaluations pass.

## Tasks and checkpoints

The executable checklist is `tasks/todo.md`. Complete it in dependency order and record results in `docs/dkl-agent/10-Verification-Record.md`.

## Current external dependencies

- No Supabase project is connected. The BizEra organization was selected by the owner, but the connector's required cost tool is unavailable, so live project creation cannot proceed through it.
- No matching Vercel project was found. Deployment must wait for a configured database and exact-head release evidence.
- Staff identities, role assignments, pricing authority, approved portfolio/SOP sources, and Lao review are business inputs. The product must deny dependent actions until configured.
