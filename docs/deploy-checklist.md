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

## 3a. Automatic preview deploys (GitHub Actions)

`.github/workflows/deploy-preview.yml` deploys to preview.dklao.com: on every push to `main`, on a pull request
labelled `deploy:preview` (and on each later push to it), or by hand (Actions > Deploy preview > Run workflow).
It runs the checks, bundles the commit as tag `preview-<run>-<sha>`, and sends it over one SSH connection to
`scripts/server/dklao-deploy` (target `preview`) on the server. That script builds as `dklao`, takes a `pg_dump` first when
`src/payload/migrations` changed, asks for a restart of `dklao-site`, waits until `http://127.0.0.1:3110/` serves
the new build, and rebuilds the previous version if anything fails. The deploy key can run nothing else. Manual
deploys (section 3) still work.

One-time setup (done on the server 2026-10-26 at the owner's request, except the GitHub steps):

- [x] Deploy key made on the server, private half in `/root/dklao-preview-deploy/id_ed25519` (root only) until it
      is saved as the GitHub secret, then deleted. Fingerprint `SHA256:CymV0YjTaqE+4z+w02EARHsRE6+55xCHPgcUOncdOxw`.
- [x] pnpm 10.29.3 for `dklao` in `~/.local/lib/pnpm-cli`, linked as `~/bin/pnpm` (on the script's `PATH`).
- [x] `scripts/server/dklao-deploy-preview` installed as `~/bin/dklao-deploy-preview` (mode 700, owner `dklao`).
- [ ] Since 0.23.0 the script is `scripts/server/dklao-deploy` and serves both targets (section 3b). Install it as
      `~/bin/dklao-deploy` (mode 700) and change the preview key's line to
      `command="/home/dklao/bin/dklao-deploy preview"`. With no target it still deploys the preview, so copying it
      over `~/bin/dklao-deploy-preview` also works in the meantime. Then delete `~/bin/dklao-deploy-preview`.
- [x] One line in `dklao`'s `~/.ssh/authorized_keys`:
      `restrict,command="/home/dklao/bin/dklao-deploy-preview" ssh-ed25519 AAAA... github-actions-dklao-preview`.
      `restrict` turns off port forwarding, agent forwarding and terminals; `command=` means the key only deploys.
      Checked: a shell or any other command gets only the usage line.
- [x] Restart without root for `dklao`: its SSH shell is cPanel's `jailshell`, where `sudo` cannot work (nosuid), so
      no sudoers rule. Instead the root units `/etc/systemd/system/dklao-site-restart.path` (watches
      `/home/dklao/.deploy/restart-request`) and `dklao-site-restart.service` (oneshot,
      `systemctl restart dklao-site`, at most 5 starts in 5 minutes) restart the site when the script writes that
      file. Root never reads the file. Checked: writing it as `dklao` restarted the service.
- [ ] Firewall: the SSH port must accept connections from GitHub-hosted runners (their addresses change; see
      `https://api.github.com/meta`, `actions`). If cPHulk or CSF limits SSH to known addresses, either allow those
      ranges for this one account or run a self-hosted runner on a DK LAO machine instead.
- [ ] GitHub > Settings > Environments > New environment `preview`: add the owner under **Required reviewers**
      (each deploy then waits for approval), deployment branches: `main` and protected or selected branches as wanted.
      Environment secrets:

| Secret | Value |
|---|---|
| `PREVIEW_SSH_KEY` | The whole private key, `/root/dklao-preview-deploy/id_ed25519` on the server (copy it straight into GitHub, never into chat or a file on a PC) |
| `PREVIEW_SSH_HOST` | `50.6.224.71` |
| `PREVIEW_SSH_PORT` | Leave unset (22) |
| `PREVIEW_SSH_KNOWN_HOSTS` | `50.6.224.71 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILYxCy02CJ58JH9bYKibk5xrVsgew2KWF7ZyuWA4QQM3` |

- [ ] Create the label `deploy:preview` (Issues > Labels). Adding it to a pull request deploys that pull request.
- [x] Tested 2026-10-26 with this key from the server itself: `deploy preview-2-f5c76d5` built, restarted and
      confirmed the new build, exit 0.
- [ ] Delete `/root/dklao-preview-deploy/` on the server once the secret is saved. To revoke: remove the line from
      `authorized_keys` and the secret from GitHub.
- [ ] First run: label a pull request or run the workflow by hand, approve it, and confirm the job ends with
      "preview.dklao.com serves X.Y.Z". Logs on the server: `~/deploy-logs/build-preview-*.log`.

## 3b. Production deploys (GitHub Actions, since 0.23.0)

**Decide first (owner).** Today the preview instance (`~/dklao-app`, `dklao-site`, port 3110) is also what
section 7 would put live. If it stays that way, every push to `main` and every `deploy:preview` pull request
deploys straight to the live site and runs its migrations on the live database.

| Option | What it means | Cost |
|---|---|---|
| **A. Separate production instance (recommended)** | Own folder (`~/dklao-live`), service (`dklao-live`, port 3120), settings file and database. The preview keeps following `main`; the live site changes only on an approved release | One more Node process (210 MB of memory measured after warm-up, 2026-10-31) and one more database on the shared server; one-time root setup below |
| B. Production on the preview instance | `dklao-site` becomes the live site. Preview deploys are switched off by the script (`SHARED_WITH_PREVIEW=yes`), so unmerged work can no longer be previewed | No extra resources; loses the preview |

**Decided 2026-11-03 (owner): option A.** www.dklao.com gets its own instance (`~/dklao-live`, service
`dklao-live`, port 3120, own database and settings file); preview.dklao.com keeps following `main` on 3110.
The steps for it are the unticked boxes below, and then section 7 puts the domain on it.

`.github/workflows/deploy-production.yml` runs only when started by hand from `main` with the version to
release. It checks that `main` is at that version and that preview.dklao.com has already deployed that exact
commit (so wait for Deploy preview on `main` to pass, and check the preview, before releasing), runs every gate
including the build, waits for approval in the GitHub `production` environment, sends tag `production-<run>-<sha>` to `~/bin/dklao-deploy production`,
which always dumps the database first, and then checks that the live site serves the version.

### Decide first: what content does the live database start with?

The live instance gets its own empty database, so this is a real choice and not a formality.

| | What you get | Cost |
|---|---|---|
| **Seed fresh** (`pnpm cms:seed`, step 7) | The 24 built-in pages and the default menu; facts unfilled | Any edit made in the preview's admin is re-entered by hand |
| **Copy the preview database** | preview.dklao.com's content exactly as it is | Test leads and draft edits come too, and are deleted afterwards |

**Decided 2026-11-03 (owner): copy the preview database.** The live site starts with preview.dklao.com's
content exactly as it is, and the clean-up below removes what should not travel with it.

**Do not open the domain on an unseeded database.** With `DATABASE_URL` set and the tables empty, the site
does not fall back to its built-in facts — read on; this is measured, not assumed:

- Pages and the menu are safe. `getPageContent` finds no published row and returns the built-in page;
  `loadNavigation` gets an empty menu, `navIsComplete` fails and the built-in menu renders.
- **Every site fact disappears.** `cmsEnabled()` is true whenever `DATABASE_URL` is set, and Payload's
  `findGlobal` answers for a never-saved global with an empty object rather than throwing (its own
  `entityDocExists` tests exactly that), so `loadSiteFacts` never reaches the `catch` that would return
  the built-in facts. `sanitizeFacts({})` makes every fact `null`, and the site hides anything bound to
  one. The globals declare no `defaultValue`, so nothing fills the gap. Nothing crashes — every consumer
  guards — but the result is a site with no phone number, no WhatsApp, no email, no address and no
  opening hours:

| Page | What a visitor sees on an empty database |
|---|---|
| Home | "Trusted by" disappears entirely (`TrustedBy` returns `null` when `referenceClients` is empty). The proof strip keeps only "Since 2010" — the 24/7 and service-area tiles are fact-bound — leaving one figure in a three-column grid |
| Footer, every page | No contact chips and no social badges (`contactChannels` returns `[]`), and no address block. The "Talk to us" heading, the quote and advisor links and the BizEra credit stay, because they come from the message files |
| `/contact` | Of the four quick cards only "Request a quote" survives; call, WhatsApp and "Visit us" are each dropped with their fact. The inquiry form and the response steps are unaffected |
| Content pages (`/forklift-rental`, `/about`, …) | Built-in copy renders, but `visibleSections` drops every item whose `fact` is empty — so rows such as delivery coverage, maintenance terms and reply times vanish from the cards |
| `/app` | Same facts, same gaps, on the contact rows |

Setup for option A, in order (root steps need the owner's go-ahead on the day). Step 0: `~/bin/dklao-deploy`
must already be the 0.24.2 script — see section 7, it is not updated by a deploy.

- [ ] **Database** (cPanel, owner): a new database and user with all privileges, so preview migrations never
      touch it (as in section 2). Use all-lowercase names — `dklao_live` and `dklao_liveapp` — because the
      capital A in `dklao_dklApp` has been a recurring trap. Let cPanel generate the password, then
      percent-encode it as `dklao`, never pasting the plain password into the URL:
      ```bash
      node -e "console.log(encodeURIComponent(process.argv[1]))" 'the-password'
      ```
- [ ] **The live folder** (as `dklao`). The first deploy overwrites the checkout, so only a populated tree
      matters; if the `ls` fails the clone landed on a detached HEAD, so run
      `git -C ~/dklao-live checkout --force main` and check again:
      ```bash
      git clone ~/dklao-app ~/dklao-live && ls ~/dklao-live/package.json
      ```
- [ ] **Its settings file** (as `dklao`), starting from the preview's so the SMTP and lead settings carry over:
      ```bash
      cp ~/.config/dklao-site.env ~/.config/dklao-live.env && chmod 600 ~/.config/dklao-live.env && nano -B ~/.config/dklao-live.env
      ```
      Change exactly four values: `APP_URL=https://www.dklao.com`, `PORT=3120`, the new `DATABASE_URL`
      (`postgres://dklao_liveapp:<encoded password>@127.0.0.1:5432/dklao_live`), and a `PAYLOAD_SECRET` of its
      own — `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`. `APP_URL` is
      mandatory: since 0.24.2 the deploy refuses to build without it, because that one value becomes the
      sitemap, every canonical and every `og:url` in the bundle.
- [ ] **Move the preview to its own address** at the same time, so the two instances stop advertising the same
      URLs: set `APP_URL=https://preview.dklao.com` in `~/.config/dklao-site.env`, then redeploy the preview
      (a restart changes `robots.txt` only — section 7).
- [ ] **The systemd units** (root). Derive them from the files that already work, so the hardening
      (`NoNewPrivileges`, `PrivateTmp`, `ProtectSystem=full`) is inherited rather than retyped:
      ```bash
      sed -e 's|dklao-app|dklao-live|g' -e 's|dklao-site|dklao-live|g' -e 's|3110|3120|g' /etc/systemd/system/dklao-site.service > /etc/systemd/system/dklao-live.service
      sed -e 's|dklao-site|dklao-live|g' -e 's|restart-request|restart-live|g' /etc/systemd/system/dklao-site-restart.path > /etc/systemd/system/dklao-live-restart.path
      sed -e 's|dklao-site|dklao-live|g' -e 's|restart-request|restart-live|g' /etc/systemd/system/dklao-site-restart.service > /etc/systemd/system/dklao-live-restart.service
      ```
      Read all three before enabling anything — the `sed` is only as good as the originals' wording. Check
      that `ExecStart` names `/home/dklao/dklao-live/server.mjs`, `EnvironmentFile` names `dklao-live.env`,
      `PORT=3120`, `HOSTNAME=127.0.0.1`, and that the restart service runs `systemctl restart dklao-live`:
      ```bash
      cat /etc/systemd/system/dklao-live.service /etc/systemd/system/dklao-live-restart.path /etc/systemd/system/dklao-live-restart.service
      ```
      Then enable them, but do **not** start `dklao-live`: there is no build in `~/dklao-live` until the first
      deploy. Port 3120 needs no firewall rule (it binds `127.0.0.1`), but leave it closed if ports are listed
      explicitly:
      ```bash
      systemctl daemon-reload && systemctl enable --now dklao-live-restart.path && systemctl enable dklao-live
      ```
- [ ] **Point the deploy script at the target** (as `dklao`). Without this file it refuses production deploys:
      ```bash
      install -m 600 /dev/null ~/.config/dklao-deploy-production.conf && nano -B ~/.config/dklao-deploy-production.conf
      ```
      ```txt
      APP=~/dklao-live
      PORT=3120
      ENV_FILE=~/.config/dklao-live.env
      RESTART_REQUEST=~/.deploy/restart-live
      ```
- [ ] **A second deploy key, production only** (root). The forced command is what stops the key doing anything
      else:
      ```bash
      mkdir -p /root/dklao-production-deploy && ssh-keygen -t ed25519 -N '' -C github-actions-dklao-production -f /root/dklao-production-deploy/id_ed25519
      printf 'restrict,command="/home/dklao/bin/dklao-deploy production" %s\n' "$(cat /root/dklao-production-deploy/id_ed25519.pub)" >> /home/dklao/.ssh/authorized_keys
      ```
      Copy the private half straight into the GitHub secret below — into the browser, never into chat or a file
      on a PC — then delete `/root/dklao-production-deploy/`. To revoke: remove the line and the secret.
- [ ] **GitHub > Settings > Environments > `production`**: the owner as **Required reviewer** (this is the gate
      that makes production manual), deployment branches `main` only, secrets `PRODUCTION_SSH_KEY` (the private
      key), `PRODUCTION_SSH_HOST` = `50.6.224.71`, `PRODUCTION_SSH_KNOWN_HOSTS` =
      `50.6.224.71 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILYxCy02CJ58JH9bYKibk5xrVsgew2KWF7ZyuWA4QQM3`, optional
      `PRODUCTION_SSH_PORT` (leave unset for 22), and optionally the variable `PRODUCTION_URL` (default
      `https://www.dklao.com`).
- [ ] **First release and content.** Actions > Deploy production > Run workflow on `main` with the version in
      `package.json`, then approve it. Expect the final "Check the live site" step to fail while www still
      serves the static page (section 7 explains why); confirm on the server instead, as `dklao`:
      ```bash
      curl -s http://127.0.0.1:3120/ | grep -o 'favicon.ico?v=[0-9.]*'
      ```
      Then act on the content decision above. Seed fresh:
      ```bash
      set -a; . ~/.config/dklao-live.env; set +a; cd ~/dklao-live && npx -y pnpm@10.29.3 cms:seed
      ```
      **Or — the owner's choice — copy the preview database.** The preview is only read, never written. Stop
      the live service first: the restore drops and recreates every table, and Payload holds open connections
      that make those drops wait or fail. As root: `systemctl stop dklao-live`. Then as `dklao`:
      ```bash
      pg_dump --dbname="$(grep -m1 '^DATABASE_URL=' ~/.config/dklao-site.env | cut -d= -f2- | tr -d '"')" --no-owner --no-acl --clean --if-exists > ~/backups/preview-to-live-$(date +%F).sql
      psql --dbname="$(grep -m1 '^DATABASE_URL=' ~/.config/dklao-live.env | cut -d= -f2- | tr -d '"')" --set ON_ERROR_STOP=on -f ~/backups/preview-to-live-$(date +%F).sql
      ```
      `--no-owner --no-acl` is what makes this work when the live user does not own the preview's objects: the
      dump then carries no `ALTER ... OWNER TO dklao_app` or `GRANT` lines, so every object is created owned by
      whoever runs the restore. `--clean --if-exists` drops the empty tables the migration made, so the restore
      does not collide with them; `ON_ERROR_STOP=on` stops at the first real error instead of leaving a
      half-restored database. `payload_migrations` comes across too, so the live instance's migration state
      matches the preview's and the next release does not try to re-run anything.
- [ ] **Clean up what must not travel with the copy** (only for the copy route), before the service starts
      again. A full copy brings the preview's customer leads, its admin accounts and their password hashes,
      its open sessions and its admin UI state:
      ```sql
      TRUNCATE lead_photos, leads, lead_rate_limits, users_sessions,
               payload_locked_documents_rels, payload_locked_documents,
               payload_preferences_rels, payload_preferences
      RESTART IDENTITY CASCADE;
      ```
      Checked against the migrations: only `users_sessions`, `payload_locked_documents_rels` and
      `payload_preferences_rels` reference `users`, all three `ON DELETE cascade` and all three already in the
      list, so no content table can be reached by the `CASCADE`. `pages`, `pages_locales`, `navigation`,
      `site_facts`, `articles` and `payload_migrations` are deliberately untouched — they are the content being
      copied.
      - **`users` is deliberately NOT in that list (owner, 2026-11-03): the preview's accounts are kept**, so
        the same people sign in to the live admin with the same passwords and no account has to be recreated.
        The consequence to accept is that preview credentials become production credentials; the clean-up
        below is to change those passwords once the live site is up. Adding `users` to the `TRUNCATE` is the
        other route: Payload then shows the create-first-user screen and the accounts are made fresh.
      - `users_sessions` **is** truncated, so everyone signs in again once. That is wanted: it drops any
        session opened against the preview.
      - A **new `PAYLOAD_SECRET` is safe** with the copied accounts: no field in this project is declared
        `encrypted`, and Payload stores a per-user password hash in the row, so the new secret only
        invalidates existing sessions, which the `TRUNCATE` clears anyway.
      - **Lead photos are files on disk, not rows**, in `LEAD_PHOTOS_DIR` or `<app folder>/data/cms-lead-photos`
        — so the live instance's folder is `~/dklao-live/data/cms-lead-photos`, a different folder from the
        preview's. Emptying `lead_photos` is what keeps the admin from listing photos whose files are not
        there. If leads ever do need to be carried over, copy that folder with the database.
      Then start the service as root: `systemctl start dklao-live`.
- [ ] **Check the accounts instead of registering one.** The copy route keeps `users`, so `/admin` on the live
      instance shows a sign-in page, not the create-first-user screen of section 5 — the owner, editor and
      advisor accounts are already there with the passwords they have on the preview. Sign in and:
      - **Change the password of every account**, the owner's first. These are production credentials now,
        and they were last set for a preview that was only ever meant to be seen by the team. Keep the new
        ones in the password manager.
      - Confirm each account's role is what it should be on the live site (section 6 checks this from the
        other side: an editor cannot open Leads, an advisor cannot open Pages or Users).
      - Delete any account that only ever existed for testing.
      - Everyone signs in again anyway, because `users_sessions` was truncated.
- [ ] In section 7, point the `dklao.com` Apache include at `http://127.0.0.1:3120/` instead of 3110.

For option B, the production settings file names the preview instance and confirms it
(`APP=~/dklao-app`, `PORT=3110`, `ENV_FILE=~/.config/dklao-site.env`,
`RESTART_REQUEST=~/.deploy/restart-request`, `SHARED_WITH_PREVIEW=yes`); remove the preview key and
the `PREVIEW_*` secrets at go-live.

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
- [x] Photo uploads: checked from outside on 2026-11-02 against preview.dklao.com. An 11 MB body was
      accepted by nginx and Apache and refused by the app itself (`{"code":"VALIDATION_ERROR" … "Request is
      too large"}`, HTTP 400, 11,534,336 bytes uploaded), not by nginx's own 413 page. So the server already
      passes requests this size and no nginx change is needed. Re-check with the command in step 4 below if
      the host changes its settings. The original instructions are kept for that:
      requests up to about 11 MB must reach the app on `/api/leads/service`,
      `/api/leads/spare-parts` and `/api/leads/warehouse` (two 5 MB photos plus the form). The app enforces
      the limits itself: about 10.1 MB on those three routes and 20 KB on the other lead forms
      (`src/lib/leads/intake.ts`). So nginx only has to let these requests through; nothing else changes.
      Not checked from the development PC: no SSH access, and preview.dklao.com did not answer on
      2026-11-02. As root:
      1. Find the current limit. cPanel's ea-nginx sets one value for the whole server:
         `grep -h client_max_body_size /etc/nginx/ea-nginx/settings.json /etc/nginx/conf.d/*.conf /etc/nginx/nginx.conf`.
         If it is `0` (no limit) or `12m` or more, leave it; nginx already passes the photos.
      2. Only if it is smaller: add `/etc/nginx/conf.d/users/dklao/dklao.com/photo-uploads.conf` (and the same
         under `.../dklao/preview.dklao.com/` while the preview runs). cPanel includes these files inside the
         domain's `server` block, so other paths keep the default:
         ```nginx
         location ~ ^/api/leads/(service|spare-parts|warehouse)$ {
             client_max_body_size 12m;
             # Copy here the proxy lines from the domain's `location /` in /etc/nginx/conf.d/users/dklao.conf,
             # so this location is passed to Apache in the same way.
         }
         ```
         Then `nginx -t && /scripts/restartsrv_nginx`.
      3. Apache: `grep -Rh LimitRequestBody /etc/apache2/conf /etc/apache2/conf.d`. No match means Apache's
         default (1 GiB since 2.4.54), which is fine.
      4. Check from outside with a body that the app refuses and does not save. Make an 11 MB file of zero
         bytes with `head -c 11534336 /dev/zero > eleven.bin`, then:
         `curl -s -o - -w ' HTTP %{http_code}\n' -X POST -H 'Content-Type: application/json' --data-binary @eleven.bin https://dklao.com/api/leads/quote`.
         Expected: the app's JSON `"Request is too large"` with HTTP 400. nginx's HTML "413 Request Entity Too
         Large" means step 2 is still needed. (`/api/leads/quote` is used because its 20 KB cap refuses the body
         without saving anything; the same nginx limit applies to the photo routes.)
- [ ] Settings in `/home/dklao/.config/dklao-site.env` (owner `dklao`, mode 600; edit with `nano -B` over
      SSH or File Manager, never committed), then `systemctl restart dklao-site`:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `APP_URL` | `https://www.dklao.com` |
| `DATABASE_URL` | `postgres://dklao_app:<percent-encoded password>@127.0.0.1:5432/dklao_dklApp` |
| `DATABASE_POOL_MAX` | `5` |
| `PAYLOAD_SECRET` | New random 32 bytes (see `.env.example`), different from any developer machine. Since 0.21.3 the service refuses to start (exit 1, reason in the journal) when it is shorter than 32 characters |
| `SMTP_HOST`, `SMTP_PORT` | `mail.dklao.com`, `465` |
| `SMTP_USER`, `SMTP_PASS` | `notify@dklao.com` and its mailbox password (owner choice, 2026-10-25; `website@dklao.com` does not exist) |
| `LEAD_NOTIFY_EMAIL` | `info@dklao.com` |
| `LEAD_RATE_LIMIT`, `LEAD_RATE_WINDOW_SECONDS` | Optional. Defaults 5 requests per 600 seconds per address |
| `LEAD_RATE_STORE` | Optional. The quote-form limit is counted in the database (table `lead_rate_limits`) whenever `DATABASE_URL` is set, so every server process shares it; `memory` forces the per-process count |
| `DATABASE_CONNECT_TIMEOUT_MS` | Optional. Default 5000: a query waits at most this long for a database connection |
| `OPS_ALERT_WEBHOOK_URL`, `OPS_ALERT_WEBHOOK_SECRET` | Recommended. Where alerts go (Slack or Discord webhook, n8n, Make): see section 9 |
| `OPS_ALERT_EMAIL` | Optional. Alert email addresses, sent through the SMTP account above |
| `LEAD_SHARED_RATE_LIMIT` | Optional. Default 60 per window for requests without `X-Real-IP`. A `[leads] ... without a usable X-Real-IP` line in the journal means the proxy stopped passing the address: fix the proxy |
| `LEAD_NOTIFY_WEBHOOK_URL` and its secret | Optional, only if a WhatsApp or chat automation is added |

- [x] Filled 2026-10-25 at the owner's request without anyone seeing a password: the server generated a new
      random password for `dklao_app` (replacing the one pasted in chat) and for `notify@dklao.com` (any mail
      app using notify@ needs the new one from the env file), and wrote both only into the env file.
      Earlier copy: `/home/dklao/.config/dklao-site.env.bak-20261025130445`.
- [x] Migrations run when the service starts (`prodMigrations`): all applied on 2026-10-25, 31 tables. The Supabase lockdown migration does nothing on this server (no Supabase roles).
- [ ] Before each later migration: `pg_dump -U dklao_app -h 127.0.0.1 dklao_dklApp > ~/backups/dklao_dklApp-<date>.sql`.
- [ ] `systemctl restart dklao-site` (root) after every build or settings change.

## 5. First start (before anything is public)

Test on a temporary address first: `preview.dklao.com` (done 2026-10-26). Cloudflare record: A `preview` →
`50.6.224.71`, proxied, so Cloudflare's certificate serves HTTPS. nginx restores the visitor address from
`CF-Connecting-IP` only for Cloudflare's ranges, so the admin IP lock still sees the real visitor
(checked: owner IP 200, other IP 403, public pages 200). Delete the record once dklao.com is live.

- [ ] Open `/admin`. The first account registered becomes the **owner**, so the owner registers it personally, right away.
- [ ] Create the editor and advisor accounts from the admin.
- [x] CMS emails (password reset, invites) go out through `notify@dklao.com` since 0.19.4; a Payload test
      email reached info@dklao.com on 2026-10-25 (exim log).
- [x] Run `pnpm cms:seed` on the server with the same settings (done 2026-10-25, v0.19.4: 24 pages and the
      default menu; log `~/deploy-logs/seed-v0.19.4.log`). As `dklao`:
      `set -a; . ~/.config/dklao-site.env; set +a; cd ~/dklao-app && npx -y pnpm@10.29.3 cms:seed`. It copies the confirmed facts and the built-in
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

Moving the live domain off the "coming soon" page onto the app, with option A decided in section 3b. The
order matters: the live instance answers on `127.0.0.1:3120` before anything public changes, and
`public_html` is kept, so one command puts the old page back (section 8).

Checked 2026-11-03 from a developer PC, after the owner moved the coming-soon page to
`~/public_html/backup/`: `https://preview.dklao.com/` serves the app (0.24.0), and both `dklao.com` and
`www.dklao.com` now answer **Apache's directory listing** — `Index of /`, with `backup/`, `cgi-bin/` and
`preview.dklao.com/` in it. `backup/` is that old page, not a database dump. The app's own defaults already
name the live site (`APP_URL ?? "https://www.dklao.com"` in `robots.ts`, `sitemap.ts` and both layouts), so
no code change belongs to this step.

**The host's nginx cache will show you the old page for a while, and it is not Cloudflare.** Measured the
same day: `https://www.dklao.com/` still returned the removed page with `Last-Modified: Thu, 11 Dec 2025`,
while `https://www.dklao.com/?nocache=1` returned the current listing and `/index.html` answered 404 —
`cf-cache-status: DYNAMIC` on all three, so Cloudflare was caching none of it. cPanel's ea-nginx cache keys
on the URL alone (section 4), so `/` was stale while any URL with a query was fresh.

- [ ] After any change to what the domain serves — removing the placeholder, adding the Apache include —
      clear that cache as root: `/usr/local/cpanel/scripts/ea-nginx clear_cache dklao`. Then check with a
      query string (`curl -s 'https://www.dklao.com/?nocache=1' | grep -o '<title>[^<]*</title>'`), because
      the plain URL can be stale in your browser too.
- [ ] While the app is not yet on this domain, do not leave the listing public: either put the placeholder
      back (`cp ~/public_html/backup/index.html ~/public_html/index.html`) or set `Options -Indexes` for that
      document root, so visitors get a page or a 403 instead of a file listing. The stale cache above is the
      only thing hiding it in the meantime.
- [ ] At go-live the listing stops mattering for visitors — the Cloudflare redirect below sends
      `dklao.com/*` to `https://www.dklao.com/$1` and the include proxies `www` to the app — but the origin
      would still answer it directly, so keep `Options -Indexes` (or the apex sharing the `www` virtual
      host) rather than relying on the redirect.

- [ ] Section 3b option A is finished first: `~/dklao-live`, its database and settings file, the `dklao-live`
      service and its restart path unit, `~/.config/dklao-deploy-production.conf`, the production deploy key,
      and the GitHub `production` environment with its three secrets. Without them there is nothing to point
      the domain at.
- [ ] As `dklao`, keep the coming-soon page: `cp -a ~/public_html ~/public_html.before-site`.
- [ ] Put the release on the live instance **before** the domain moves: Actions > Deploy production > Run
      workflow, on `main`, with the version in `package.json`, then approve it in the `production`
      environment. Expect the last step ("Check the live site") to fail on this first run, because
      www.dklao.com still answers with the static page; everything before it — gates, database dump, build,
      restart — has already run. Confirm on the server instead, as `dklao`:
      `curl -s http://127.0.0.1:3120/ | grep -o 'favicon.ico?v=[0-9.]*'` must print the released version.
      Build log: `~/deploy-logs/build-production-*.log`.
- [ ] Root: add the live domain's Apache includes, the same shape as the preview's (section 4) with port
      3120. Two files, identical contents — `std` is the port-80 virtual host and `ssl` the port-443 one, and
      a request arriving on either must reach the app:

      ```txt
      /etc/apache2/conf.d/userdata/std/2_4/dklao/dklao.com/dklao-live.conf
      /etc/apache2/conf.d/userdata/ssl/2_4/dklao/dklao.com/dklao-live.conf
      ```

      Contents, with `<owner IP>` the address allowed to reach the admin:

      ```apache
      ProxyPreserveHost On
      ProxyTimeout 60

      # AutoSSL writes its challenge files into the document root, so this path must NOT be proxied.
      # Exclusions have to come before the general rule.
      ProxyPass /.well-known/ !

      ProxyPass / http://127.0.0.1:3120/
      ProxyPassReverse / http://127.0.0.1:3120/

      <LocationMatch "^/(admin|api/users)(/|$)">
          Require expr "%{HTTP:X-Real-IP} == '<owner IP>'"
          Header always set Cache-Control "private, no-store"
          ErrorDocument 403 "Forbidden"
      </LocationMatch>
      ```

      This was written from section 4's description of the preview includes, not copied off the server, so
      `diff` it against
      `/etc/apache2/conf.d/userdata/ssl/2_4/dklao/preview.dklao.com/dklao-site.conf` before the rebuild and
      keep whatever that file carries beyond this. The `LocationMatch` block is the same decision as section
      4: on the live domain keep `/admin` and `/api/users` restricted to the owner's address unless the owner
      wants editors to sign in from anywhere. Without its `Cache-Control` and `ErrorDocument` lines Apache
      answers with the app's 404 page, which nginx caches under `/admin` and then replays to the owner too.

      Then, as root:

      ```bash
      /scripts/rebuildhttpdconf && /scripts/restartsrv_httpd --graceful
      /usr/local/cpanel/scripts/ea-nginx clear_cache dklao
      ```
- [ ] Check the server answers for the live name before touching DNS, bypassing Cloudflare:
      `curl -sI --resolve www.dklao.com:443:50.6.224.71 https://www.dklao.com/` (200, and
      `curl -s --resolve ... | grep favicon.ico?v=` shows the version).
- [ ] Cloudflare: **the records already point here and need no change** — read from the zone on 2026-11-03,
      `dklao.com` is an `A` to `50.6.224.71`, proxied, and `www.dklao.com` is a **`CNAME` to `dklao.com`**,
      proxied. A CNAME is correct for `www`; flattening only matters at the apex, which has the `A` record.
      What does still need setting: SSL mode **Full (strict)** — the server has an AutoSSL certificate, and
      Flexible would send plain HTTP to the origin — and a redirect rule sending `dklao.com/*` to
      `https://www.dklao.com/$1` (301), so one address matches `APP_URL`. Then clear the host cache:
      `/usr/local/cpanel/scripts/ea-nginx clear_cache dklao`.

Three things in the zone are not about go-live but were found while checking it (2026-11-03, 33 records):

- [ ] **Three SPF records name hosts that have nothing to do with DK LAO or this server:**
      `and.dklao.com` → `"v=spf1 ip4:45.11.89.32/29 ~all"`, `bin.dklao.com` →
      `"v=spf1 include:lithegvg.cc -all"`, and `card.dklao.com` → `"v=spf1 ip4:154.52.122.114 … ~all"`.
      `and`, `bin` and `card` are not names anyone chooses, and each record authorizes a stranger's servers
      to send mail that passes SPF as `someone@<that name>.dklao.com`; `_dmarc` carries `sp=none`, so
      subdomain spoofing is not blocked either. Ask whoever held DNS before this; if nobody claims them,
      delete all three. The owner decides — never remove mail records on a guess.
- [ ] `ftp` and `webdisk` are **Proxied**, which breaks them. Cloudflare's proxy only carries HTTP/HTTPS on
      a fixed port list, and FTP (21) and Web Disk (2077/2078) are not on it, so set both to **DNS only**.
      `cpanel`, `whm` and `webmail` use ports that are on the list (2083, 2087, 2096) so they do work
      proxied, but cPanel's own guidance is DNS only for all of them, because the proxy interferes with
      AutoSSL renewal.
- [ ] `50-6-224-71.unifiedlayer.com.dklao.com` is a malformed record — a hostname typed into a name field,
      so the zone name got appended. Harmless; delete it.
- [ ] Stop the preview claiming the live address: `~/.config/dklao-site.env` carries
      `APP_URL=https://www.dklao.com` (section 4), so preview.dklao.com's `/robots.txt` says
      `Host: https://www.dklao.com` and its canonicals and sitemap name the live site — measured 2026-11-03.
      Set it to `APP_URL=https://preview.dklao.com` and `systemctl restart dklao-site`. Since 0.24.1 that one
      change also keeps the preview out of search results: `src/app/robots.ts` serves `Disallow: /` for any
      host that is not `https://www.dklao.com`, so no second setting is needed. After the restart,
      `https://preview.dklao.com/robots.txt` must read `User-Agent: *` / `Disallow: /` with
      `Host: https://preview.dklao.com`; if it still names www, the settings file did not take. The live
      domain is unaffected — it keeps `Allow: /` with `/admin` and `/api` disallowed.

      `robots.txt` alone is served per request (`force-dynamic` since 0.24.1), so a restart is enough for
      it. **Everything else that reads `APP_URL` is baked in by the build** — `/sitemap.xml`, every page's
      `canonical` and `og:url` (`metadataBase` in both site layouts) and the breadcrumb JSON-LD — so those
      need a **redeploy**, not a restart. Since 0.24.2 `dklao-deploy`'s `build()` reads `APP_URL` out of the
      instance's `$ENV_FILE` and passes it to `pnpm build`, and **refuses to deploy if that key is missing
      or empty** rather than quietly baking in the www default. So the order is: edit the env file, then
      re-run that instance's deploy workflow. Measured on 2026-11-03 with a build given
      `APP_URL=https://preview.dklao.com`: the sitemap's `<loc>` entries, `/about`'s canonical and `og:url`,
      and the breadcrumb JSON-LD on `/forklift-rental` all carried the preview host, and no page contained
      `www.dklao.com`.

      The server's copy of that script is `~/bin/dklao-deploy`, which is **not** updated by a deploy — it is
      the thing that runs the deploy. Copy it from `scripts/server/dklao-deploy` in the repo (`chmod 700`)
      before relying on this behaviour, and keep its old copy until the next deploy has succeeded.
- [ ] Re-check section 6 on the real domain, plus `/sitemap.xml` and `/robots.txt` (both must name
      `https://www.dklao.com`), and that `/admin` still answers only from the owner's address.
- [ ] Re-run the production workflow once the domain is live, so its final check passes and the version is
      confirmed from outside. From then on every release ends with "www.dklao.com serves X.Y.Z".
- [ ] Keep the ngrok preview off once the site is live.

## CMS email access rollout (1.0.0)

The production `/admin` IP rule remains active during the 1.0.0 code deploy and migration. The migration creates `admin_allowlist`, invalidates non-owner sessions, and keeps the owner able to recover access. After the release is healthy, the owner signs in from the currently allowed address and adds the existing adviser account under **Access → Admin access emails**. The adviser can then add existing editor and adviser emails; no allowlist entry creates an account or changes a role.

Only after that bootstrap, remove the Apache `<LocationMatch>` IP rule for `/admin` and `/api/users` on both apex and `www` virtual hosts, rebuild Apache config, restart it gracefully, and clear nginx cache. Check that an approved account signs in from a different IP, an existing unapproved account receives 403 after valid credentials, and the adviser can add and remove entries. Removing an entry should end that user's sessions. If this check fails, restore the IP rule before rolling back code; the new table can remain until a coordinated database rollback.

## 8. Rollback

- Site: remove the dklao.com Apache include (rebuild and restart Apache) and restore `~/public_html.before-site`.
  For a bad release: `git checkout <previous tag>`, `pnpm install --frozen-lockfile && pnpm build`, restart.
- Database: restore the `pg_dump` taken before the migration
  (`psql -U dklao_app -h 127.0.0.1 dklao_dklApp < ~/backups/dklao_dklApp-<date>.sql`) or the nightly cPanel
  backup. Migrations are forward-only; do not edit a migration that has run.
- Leads that arrived while the database was down are in `~/dklao-app/data/leads-local.jsonl` (mode 600) and in
  the info@dklao.com inbox, where their subject starts with `[NOT IN CMS]`; the journal has a
  `[leads] FALLBACK <leadId>` line for each. Once the database is back, import them into `/admin`, keeping
  their references, with `pnpm cms:import-fallback-leads` in `~/dklao-app` with the site's settings loaded.
  It skips leads already in the CMS, so it is safe to run again, and never edits the file. When it reports
  no failures and no invalid lines, move the file out of the app folder (for example to `~/backups/`).

## 9. Alerts (since 0.23.0)

The app raises an alert when the lead pipeline is degraded (`src/lib/ops/alert.ts`):

| Alert | Severity | Meaning |
|---|---|---|
| `lead.all_failed` | critical | A request could not be saved, emailed or sent: the visitor was asked to call |
| `lead.not_in_cms` | warning | The database save failed or took over 8 seconds; the lead is in `data/leads-local.jsonl` (section 8) |
| `lead.email_failed`, `lead.webhook_failed` | warning | The lead was saved, but one notification failed |
| `ratelimit.store_failed` | warning | The shared rate limit in the database failed; limiting from memory |
| `ratelimit.no_address` | warning | Requests arrive without `X-Real-IP`: check the proxy |

- [ ] Create an incoming webhook (for example a Slack or Discord channel the owner reads on the phone) and set
      `OPS_ALERT_WEBHOOK_URL` (and `OPS_ALERT_WEBHOOK_SECRET` if the receiver checks signatures). Email alone
      (`OPS_ALERT_EMAIL`) cannot report an SMTP failure.
- [ ] Test it: stop PostgreSQL for a minute on the preview and send a quote; a `lead.not_in_cms` alert arrives.
- Each kind is sent at most once per 15 minutes (`OPS_ALERT_THROTTLE_SECONDS`); the next one says how many were
  held back. Every alert is also in the journal: `journalctl -u dklao-site | grep '\[alert\]'`.

## 10. Not covered yet

- Media uploads and where uploaded files are stored (the app folder is replaced on each release).
- An uptime check on `https://www.dklao.com/` and on the admin from outside the server (for example a free
  external monitor). The app's alerts cannot report the app being down.
- Home and About copy still live in `src/lib/data/`, not the CMS.
- Lao content, article pages and redirects (Phase 4).
