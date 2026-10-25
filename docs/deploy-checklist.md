# Deploy checklist: dklao.com cPanel server

The site, its admin and its database run on DK LAO's own cPanel server. This replaces the earlier
Vercel and Supabase plan (owner decision, 2026-10-25); the old version is in git history.

This is a checklist for a human or an approved agent. Each step that changes the server or DNS needs the
owner's go-ahead on that day. Values for passwords and secrets are typed by the owner and never committed.

## The server

| Item | Value (checked 2026-10-25) |
|---|---|
| Server | `host.bizera.la`, 50.6.224.71, AlmaLinux 9.8, cPanel & WHM 11.138, Apache 2.4 |
| Shared with | 11 other cPanel accounts (including `laogencms`). 4 CPUs, 7.6 GB memory, about 3.4 GB free |
| cPanel account | `dklao`, home `/home/dklao`, 22 GB of 30 GB disk free, AutoSSL certificate for dklao.com |
| Database | PostgreSQL 16.15, local connections only. Database `dklao_dklApp`, user `dklao_app` (member of role `dklao_dklApp`, can create tables) |
| Mail | `mail.dklao.com` on the same server, SMTP 465. Lead email sends from `website@dklao.com` to `info@dklao.com` |
| Node.js | 22.23 (`ea-nodejs22`, since 2026-10-25) with Phusion Passenger 6.2.1 for cPanel's Application Manager |
| DNS | Cloudflare in front of dklao.com; SSH and mail use `mail.dklao.com` |
| SSH | `ssh dklao-cpanel` (account, key `winbizeraSSH`) or `ssh bizera-root` (root, key only) |

## 0. Decide before starting

| Question | Why it matters | Answer |
|---|---|---|
| Which email owns the first CMS account? | The first person to register at `/admin` becomes the owner | |
| When may dklao.com switch from the "coming soon" page? | The switch replaces what visitors see | |
| Are the live-page phone and WhatsApp numbers confirmed? | Facts stay hidden until confirmed | |
| Is a nightly cPanel backup of the `dklao` account turned on, and where is it stored? | It is the only copy of leads and content | |

## 1. One-time server setup (root, needs the owner's approval)

These change the whole server, not only the dklao account.

- [x] EasyApache 4: `ea-apache24-mod-passenger` 6.2.1 (Phusion Passenger) and `ea-nodejs22` 22.23.4 installed
      2026-10-25, without weak dependencies, replacing `ea-nodejs20` (only one EasyApache Node.js can be
      installed; nothing on the host used Node 20). Passenger also brought AlmaLinux's Ruby 3.0 and Node.js 16
      (`/usr/bin/node`); `/usr/local/bin/node`, `npm` and `npx` point to Node 22 and come first on the PATH.
      Apache restarted gracefully. Logs: `/root/ea4-passenger-20261025.log`, site checks
      `/root/ea4-passenger-20261025-before.txt` and `-after.txt`.
      Rollback: remove `ea-apache24-mod-passenger ea-passenger-runtime`, install `ea-nodejs20`, point the three
      links back to `/opt/cpanel/ea-nodejs20/bin/`, `/scripts/restartsrv_httpd --graceful`.
- [x] Application Manager ("passengerapps") is on in the `default` feature list; UAPI `PassengerApps` answers for `dklao`.
- [ ] WHM, Backup Configuration: nightly account backups on, including databases. cPanel account backups
      include PostgreSQL databases.
- [ ] Rotate the passwords that were pasted into chat (cPanel `dklao`, SSH user `admin`, key passphrase).

## 2. Database (done 2026-10-25)

- [x] PostgreSQL 16 installed with cPanel's `installpostgres` (log `/root/installpostgres-20261025.log`).
- [x] Database `dklao_dklApp` (created by the owner in cPanel) and user `dklao_app`, all privileges granted;
      `dklao_app` can create tables in `public`. Note the capital A: the name is case-sensitive everywhere.
- [x] Owner set the `dklao_app` password in cPanel. It was pasted into chat on 2026-10-25, so change it
      once more before go-live and keep the new one in the password manager only.
- [x] The unused, empty `dklao_site` database (and its role) was deleted through cPanel on 2026-10-25 at the
      owner's request. `dklao_dklApp` is the only dklao PostgreSQL database.
- [ ] The password contains characters such as `= ] ? ) {`. In `DATABASE_URL` it must be percent-encoded:
      run `node -e "console.log(encodeURIComponent(process.argv[1]))" 'the-password'` on the server and use
      the output. Do not paste the plain password into the URL.
- [ ] Do not open port 5432 in the firewall. The site connects from the same server.

## 3. Put the code on the server

- [x] The repository is private and the server has no deploy key, so each release travels as a git bundle
      from a developer PC: `git bundle create dklao-vX.Y.Z.bundle vX.Y.Z`, `scp` it to `/home/dklao/`, then
      as `dklao`: `cd ~/dklao-app && git fetch ~/dklao-vX.Y.Z.bundle 'refs/tags/*:refs/tags/*' && git checkout vX.Y.Z`.
      (First time: `git clone ~/dklao-v0.19.2.bundle ~/dklao-app`.)
- [x] Start file: `server.mjs` serves the built app on `PORT`/`HOSTNAME` and stops cleanly on SIGTERM
      (`app.js` also loads it, for Passenger; not used now). Local check after a build: `node server.mjs`.
- [ ] Install and build on the server, so native packages such as `sharp` get Linux binaries:
      `cd ~/dklao-app && pnpm install --frozen-lockfile && pnpm build` (logs in `~/deploy-logs/`).
      Build outside busy hours: the build uses about 2 GB of memory on a shared server. If it runs out,
      set `NODE_OPTIONS=--max-old-space-size=2048` or switch Next.js to `output: "standalone"`.
- [ ] Never copy `.env.local` from a developer machine. Settings go in the env file (section 4).

## 4. Run the app (systemd service behind Apache; owner decision 2026-10-25)

cPanel's Application Manager was dropped: its saves did not reach the server and its npm dependency step
fails on the pnpm layout. The app runs outside cPanel instead. Backups of every file changed are in
`/root/backups/dklao-20261025/`.

- [x] `/etc/systemd/system/dklao-site.service`: `User=dklao`, `ExecStart=/opt/cpanel/ea-nodejs22/bin/node
      /home/dklao/dklao-app/server.mjs`, `NODE_ENV=production`, `PORT=3110`, `HOSTNAME=127.0.0.1`,
      `EnvironmentFile=/home/dklao/.config/dklao-site.env`, `Restart=on-failure`, `NoNewPrivileges`,
      `PrivateTmp`, `ProtectSystem=full`. Enabled; port 3110 is closed in the firewall.
- [x] Apache includes `/etc/apache2/conf.d/userdata/{std,ssl}/2_4/dklao/preview.dklao.com/dklao-site.conf`
      proxy the subdomain to `http://127.0.0.1:3110/` (keeping `/.well-known/` for AutoSSL). An nginx include
      does not work: cPanel's server block already has `location /`. For go-live, the same include goes under
      `.../dklao/dklao.com/`; then `/scripts/rebuildhttpdconf && /scripts/restartsrv_httpd --graceful`.
- [x] `/admin` and `/api/users` answer only from the owner's IP while the preview is open:
      `<LocationMatch "^/(admin|api/users)(/|$)"> Require expr "%{HTTP:X-Real-IP} == '<owner IP>'" </LocationMatch>`
      in both includes (nginx sets `X-Real-IP` to the connecting address, so visitors cannot fake it).
      Inside the same block: `Header always set Cache-Control "private, no-store"` and
      `ErrorDocument 403 "Forbidden"`. Without them Apache answers with the app's 404 page, which nginx caches
      under `/admin` and then replays to the owner too. Others see a plain 403. Change the IP when the owner's
      address changes, then `/usr/local/cpanel/scripts/ea-nginx clear_cache dklao`.
- [x] The app sends `Cache-Control: private, no-store` for `/api` and `/admin`, because the host's nginx cache
      keys on the URL alone (`next.config.ts`).
- [ ] Settings in `/home/dklao/.config/dklao-site.env` (owner `dklao`, mode 600; edit with `nano -B` over
      SSH or File Manager, never committed), then `systemctl restart dklao-site`:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `APP_URL` | `https://www.dklao.com` |
| `DATABASE_URL` | `postgres://dklao_app:<percent-encoded password>@127.0.0.1:5432/dklao_dklApp` |
| `DATABASE_POOL_MAX` | `5` |
| `PAYLOAD_SECRET` | New random 32 bytes (see `.env.example`), different from any developer machine |
| `SMTP_HOST`, `SMTP_PORT` | `mail.dklao.com`, `465` |
| `SMTP_USER`, `SMTP_PASS` | `website@dklao.com` and its mailbox password |
| `LEAD_NOTIFY_EMAIL` | `info@dklao.com` |
| `LEAD_RATE_LIMIT`, `LEAD_RATE_WINDOW_SECONDS` | Optional. Defaults 5 requests per 600 seconds per address |
| `LEAD_NOTIFY_WEBHOOK_URL` and its secret | Optional, only if a WhatsApp or chat automation is added |

- [ ] Migrations run when the service starts (`prodMigrations`); check `journalctl -u dklao-site` after the
      first start. The Supabase lockdown migration does nothing on this server (no Supabase roles).
- [ ] Before each later migration: `pg_dump -U dklao_app -h 127.0.0.1 dklao_dklApp > ~/backups/dklao_dklApp-<date>.sql`.
- [ ] `systemctl restart dklao-site` (root) after every build or settings change.

## 5. First start (before anything is public)

Test on a temporary address first, for example a `preview.dklao.com` subdomain in the dklao account
pointed at the same app, protected with cPanel Directory Privacy.

- [ ] Open `/admin`. The first account registered becomes the **owner**, so the owner registers it personally, right away.
- [ ] Create the editor and advisor accounts from the admin.
- [ ] Run `pnpm cms:seed` on the server with the same settings. It copies the confirmed facts and the built-in
      pages, and never overwrites rows an editor has changed.
- [ ] Fill in the facts the owner has confirmed. Leave the others empty: empty facts stay hidden.
- [ ] Send a test quote. Check that it appears under Leads and arrives at info@dklao.com, then delete it.
- [ ] Check spam protection: the sixth quote from one address within ten minutes gets "too many requests".
      A made-up `X-Forwarded-For` must not reset the count (fixed in 0.19.3: the limit keys on nginx's
      `X-Real-IP`, and on `CF-Connecting-IP` only when the connection comes from Cloudflare).
- [ ] Check what visitors' addresses look like behind Cloudflare: the rate limit must see the visitor, not Cloudflare.

## 6. Verify

- [ ] `pnpm links:check https://preview.dklao.com` passes (see `con_agents/QA_CHECKLIST.md`).
- [ ] `/`, `/about`, `/contact`, `/forklift-rental`, `/request-quote`, `/app` all load.
- [ ] A fact cleared in the admin disappears from the pages within a minute.
- [ ] No page text contains `[CONFIRM]`, `[[` or `xxxx`.
- [ ] Logged out, `GET /api/leads` and `GET /api/users` return 403, and `POST /api/leads` returns 403.
- [ ] An editor account cannot open Leads. An advisor account cannot open Pages or Users.
- [ ] View source and the Network tab show no database string, SMTP details or secrets.

## 7. Go live (needs the owner's approval)

- [ ] Keep a copy of the current `public_html` ("coming soon" page): `cp -a ~/public_html ~/public_html.before-site`.
- [ ] Copy the Apache include to `dklao.com` (section 4), set `APP_URL=https://www.dklao.com`, restart the service.
- [ ] Cloudflare: SSL mode **Full (strict)** (the server has an AutoSSL certificate), and a page rule or
      redirect so `dklao.com` and `www.dklao.com` end up on one address that matches `APP_URL`.
- [ ] Re-check section 6 on the real domain, plus `/sitemap.xml` and `/robots.txt`.
- [ ] Keep the ngrok preview off once the site is live.

## 8. Rollback

- Site: remove the dklao.com Apache include (rebuild and restart Apache) and restore `~/public_html.before-site`.
  For a bad release: `git checkout <previous tag>`, `pnpm install --frozen-lockfile && pnpm build`, restart.
- Database: restore the `pg_dump` taken before the migration
  (`psql -U dklao_app -h 127.0.0.1 dklao_dklApp < ~/backups/dklao_dklApp-<date>.sql`) or the nightly cPanel
  backup. Migrations are forward-only; do not edit a migration that has run.
- Leads that arrived while the database was down are in `~/dklao-app/data/leads-local.jsonl` and in the
  info@dklao.com inbox.

## 9. Not covered yet

- Media uploads and where uploaded files are stored (the app folder is replaced on each release).
- Monitoring and alerts: an uptime check on `https://www.dklao.com/` and on the admin.
- Home and About copy still live in `src/lib/data/`, not the CMS.
- Lao content, article pages and redirects (Phase 4).
